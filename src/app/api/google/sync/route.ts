import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  googleCalendarToken,
  googleCalendarSync,
  nurseSchedule,
  patientSchedule,
  nurse,
  patient,
  shift,
  room,
  user,
} from "@/db/schema";
import { requireAuth } from "@/lib/api/auth";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  formatScheduleToCalendarEvent,
} from "@/lib/google/calendar";
import { eq, and, gte, lte } from "drizzle-orm";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const userId = authResult.session.user.id;

    // Check if user has Google Calendar connected
    const token = await db
      .select()
      .from(googleCalendarToken)
      .where(eq(googleCalendarToken.userId, userId))
      .limit(1);

    return successResponse({
      connected: token.length > 0,
      calendarId: token[0]?.calendarId || "primary",
    });
  } catch (error) {
    console.error("Error checking sync status:", error);
    return serverErrorResponse("Failed to check sync status");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const userId = authResult.session.user.id;
    const body = await request.json();
    const { type, startDate, endDate } = body;

    // Get user's Google Calendar token
    const tokenResult = await db
      .select()
      .from(googleCalendarToken)
      .where(eq(googleCalendarToken.userId, userId))
      .limit(1);

    if (tokenResult.length === 0) {
      return errorResponse(
        "NOT_CONNECTED",
        "Google Calendar belum terhubung",
        400
      );
    }

    const token = tokenResult[0];
    const accessToken = token.accessToken;
    const refreshToken = token.refreshToken || undefined;

    // Date range for sync
    const syncStartDate = startDate
      ? new Date(startDate)
      : startOfMonth(new Date());
    const syncEndDate = endDate
      ? new Date(endDate)
      : endOfMonth(addMonths(new Date(), 1));

    let synced = 0;
    let errors = 0;

    if (type === "nurse" || type === "all") {
      // Sync nurse schedules
      const nurseSchedules = await db
        .select({
          id: nurseSchedule.id,
          scheduleDate: nurseSchedule.scheduleDate,
          status: nurseSchedule.status,
          notes: nurseSchedule.notes,
          nurseName: user.name,
          shiftName: shift.name,
          shiftStartTime: shift.startTime,
          shiftEndTime: shift.endTime,
          roomName: room.name,
        })
        .from(nurseSchedule)
        .innerJoin(nurse, eq(nurseSchedule.nurseId, nurse.id))
        .innerJoin(user, eq(nurse.userId, user.id))
        .innerJoin(shift, eq(nurseSchedule.shiftId, shift.id))
        .leftJoin(room, eq(nurseSchedule.roomId, room.id))
        .where(
          and(
            gte(nurseSchedule.scheduleDate, syncStartDate),
            lte(nurseSchedule.scheduleDate, syncEndDate)
          )
        );

      for (const schedule of nurseSchedules) {
        try {
          // Check if already synced
          const existingSync = await db
            .select()
            .from(googleCalendarSync)
            .where(
              and(
                eq(googleCalendarSync.userId, userId),
                eq(googleCalendarSync.scheduleType, "nurse"),
                eq(googleCalendarSync.scheduleId, schedule.id)
              )
            )
            .limit(1);

          const title = `[Perawat] ${schedule.nurseName} - ${schedule.shiftName}`;
          const description = `Jadwal Kerja Perawat\nShift: ${schedule.shiftName}\nRuangan: ${schedule.roomName || "-"}\nStatus: ${schedule.status}\nCatatan: ${schedule.notes || "-"}`;

          const calendarEvent = formatScheduleToCalendarEvent(
            {
              id: schedule.id,
              scheduleDate: format(schedule.scheduleDate, "yyyy-MM-dd"),
              shiftStartTime: schedule.shiftStartTime,
              shiftEndTime: schedule.shiftEndTime,
              status: schedule.status,
              notes: schedule.notes,
            },
            title,
            description,
            "nurse"
          );

          if (existingSync.length > 0) {
            // Update existing event
            await updateCalendarEvent(
              accessToken,
              refreshToken,
              existingSync[0].googleEventId,
              calendarEvent
            );

            await db
              .update(googleCalendarSync)
              .set({ lastSyncedAt: new Date() })
              .where(eq(googleCalendarSync.id, existingSync[0].id));
          } else {
            // Create new event
            const createdEvent = await createCalendarEvent(
              accessToken,
              refreshToken,
              calendarEvent
            );

            if (createdEvent.id) {
              await db.insert(googleCalendarSync).values({
                userId,
                scheduleType: "nurse",
                scheduleId: schedule.id,
                googleEventId: createdEvent.id,
              });
            }
          }

          synced++;
        } catch (err) {
          console.error("Error syncing nurse schedule:", err);
          errors++;
        }
      }
    }

    if (type === "patient" || type === "all") {
      // Sync patient schedules
      const patientSchedules = await db
        .select({
          id: patientSchedule.id,
          scheduleDate: patientSchedule.scheduleDate,
          status: patientSchedule.status,
          notes: patientSchedule.notes,
          patientName: patient.name,
          patientMrn: patient.medicalRecordNumber,
          shiftName: shift.name,
          shiftStartTime: shift.startTime,
          shiftEndTime: shift.endTime,
          roomName: room.name,
        })
        .from(patientSchedule)
        .innerJoin(patient, eq(patientSchedule.patientId, patient.id))
        .innerJoin(shift, eq(patientSchedule.shiftId, shift.id))
        .leftJoin(room, eq(patientSchedule.roomId, room.id))
        .where(
          and(
            gte(patientSchedule.scheduleDate, syncStartDate),
            lte(patientSchedule.scheduleDate, syncEndDate)
          )
        );

      for (const schedule of patientSchedules) {
        try {
          // Check if already synced
          const existingSync = await db
            .select()
            .from(googleCalendarSync)
            .where(
              and(
                eq(googleCalendarSync.userId, userId),
                eq(googleCalendarSync.scheduleType, "patient"),
                eq(googleCalendarSync.scheduleId, schedule.id)
              )
            )
            .limit(1);

          const title = `[HD] ${schedule.patientName} - ${schedule.shiftName}`;
          const description = `Jadwal Hemodialisis\nPasien: ${schedule.patientName} (MRN: ${schedule.patientMrn})\nShift: ${schedule.shiftName}\nRuangan: ${schedule.roomName || "-"}\nStatus: ${schedule.status}\nCatatan: ${schedule.notes || "-"}`;

          const calendarEvent = formatScheduleToCalendarEvent(
            {
              id: schedule.id,
              scheduleDate: format(schedule.scheduleDate, "yyyy-MM-dd"),
              shiftStartTime: schedule.shiftStartTime,
              shiftEndTime: schedule.shiftEndTime,
              status: schedule.status,
              notes: schedule.notes,
            },
            title,
            description,
            "patient"
          );

          if (existingSync.length > 0) {
            // Update existing event
            await updateCalendarEvent(
              accessToken,
              refreshToken,
              existingSync[0].googleEventId,
              calendarEvent
            );

            await db
              .update(googleCalendarSync)
              .set({ lastSyncedAt: new Date() })
              .where(eq(googleCalendarSync.id, existingSync[0].id));
          } else {
            // Create new event
            const createdEvent = await createCalendarEvent(
              accessToken,
              refreshToken,
              calendarEvent
            );

            if (createdEvent.id) {
              await db.insert(googleCalendarSync).values({
                userId,
                scheduleType: "patient",
                scheduleId: schedule.id,
                googleEventId: createdEvent.id,
              });
            }
          }

          synced++;
        } catch (err) {
          console.error("Error syncing patient schedule:", err);
          errors++;
        }
      }
    }

    return successResponse({
      synced,
      errors,
      message: `Berhasil sync ${synced} jadwal ke Google Calendar${errors > 0 ? `, ${errors} gagal` : ""}`,
    });
  } catch (error) {
    console.error("Error syncing to Google Calendar:", error);
    return serverErrorResponse("Gagal sync ke Google Calendar");
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const userId = authResult.session.user.id;

    // Delete all sync records for user
    await db
      .delete(googleCalendarSync)
      .where(eq(googleCalendarSync.userId, userId));

    // Delete token
    await db
      .delete(googleCalendarToken)
      .where(eq(googleCalendarToken.userId, userId));

    return successResponse({ message: "Google Calendar berhasil diputus" });
  } catch (error) {
    console.error("Error disconnecting Google Calendar:", error);
    return serverErrorResponse("Gagal memutus koneksi Google Calendar");
  }
}
