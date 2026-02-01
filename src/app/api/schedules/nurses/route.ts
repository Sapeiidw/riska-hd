import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { nurseSchedule, nurse, user, shift, room } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createNurseScheduleSchema } from "@/lib/validations/schedule";
import { desc, eq, sql, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.NURSE_SCHEDULE_READ
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const nurseId = searchParams.get("nurseId");
    const shiftId = searchParams.get("shiftId");
    const offset = (page - 1) * limit;

    const conditions = [];

    if (startDate) {
      conditions.push(gte(nurseSchedule.scheduleDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(nurseSchedule.scheduleDate, new Date(endDate)));
    }
    if (nurseId) {
      conditions.push(eq(nurseSchedule.nurseId, nurseId));
    }
    if (shiftId) {
      conditions.push(eq(nurseSchedule.shiftId, shiftId));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [schedules, countResult] = await Promise.all([
      db
        .select({
          id: nurseSchedule.id,
          nurseId: nurseSchedule.nurseId,
          shiftId: nurseSchedule.shiftId,
          scheduleDate: nurseSchedule.scheduleDate,
          roomId: nurseSchedule.roomId,
          status: nurseSchedule.status,
          notes: nurseSchedule.notes,
          createdAt: nurseSchedule.createdAt,
          nurseName: user.name,
          nurseNip: nurse.nip,
          shiftName: shift.name,
          shiftStartTime: shift.startTime,
          shiftEndTime: shift.endTime,
          roomName: room.name,
          roomCode: room.code,
        })
        .from(nurseSchedule)
        .innerJoin(nurse, eq(nurseSchedule.nurseId, nurse.id))
        .innerJoin(user, eq(nurse.userId, user.id))
        .innerJoin(shift, eq(nurseSchedule.shiftId, shift.id))
        .leftJoin(room, eq(nurseSchedule.roomId, room.id))
        .where(whereClause)
        .orderBy(desc(nurseSchedule.scheduleDate), desc(nurseSchedule.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(nurseSchedule)
        .where(whereClause)
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(schedules, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching nurse schedules:", error);
    return serverErrorResponse("Gagal memuat jadwal perawat");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.NURSE_SCHEDULE_CREATE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createNurseScheduleSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const newSchedule = await db
      .insert(nurseSchedule)
      .values({
        nurseId: data.nurseId,
        shiftId: data.shiftId,
        scheduleDate: new Date(data.scheduleDate),
        roomId: data.roomId || null,
        status: data.status,
        notes: data.notes || null,
      })
      .returning();

    // Get full schedule data with joins
    const fullSchedule = await db
      .select({
        id: nurseSchedule.id,
        nurseId: nurseSchedule.nurseId,
        shiftId: nurseSchedule.shiftId,
        scheduleDate: nurseSchedule.scheduleDate,
        roomId: nurseSchedule.roomId,
        status: nurseSchedule.status,
        notes: nurseSchedule.notes,
        createdAt: nurseSchedule.createdAt,
        nurseName: user.name,
        nurseNip: nurse.nip,
        shiftName: shift.name,
        shiftStartTime: shift.startTime,
        shiftEndTime: shift.endTime,
        roomName: room.name,
        roomCode: room.code,
      })
      .from(nurseSchedule)
      .innerJoin(nurse, eq(nurseSchedule.nurseId, nurse.id))
      .innerJoin(user, eq(nurse.userId, user.id))
      .innerJoin(shift, eq(nurseSchedule.shiftId, shift.id))
      .leftJoin(room, eq(nurseSchedule.roomId, room.id))
      .where(eq(nurseSchedule.id, newSchedule[0].id))
      .limit(1);

    return successResponse(fullSchedule[0], undefined, 201);
  } catch (error) {
    console.error("Error creating nurse schedule:", error);
    if (
      error instanceof Error &&
      error.message.includes("unique constraint")
    ) {
      return serverErrorResponse(
        "Jadwal untuk perawat ini di shift dan tanggal yang sama sudah ada"
      );
    }
    return serverErrorResponse("Gagal membuat jadwal perawat");
  }
}
