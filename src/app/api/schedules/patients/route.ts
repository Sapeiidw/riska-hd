import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  patientSchedule,
  patient,
  shift,
  room,
  hdMachine,
  nurse,
  user,
} from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createPatientScheduleSchema } from "@/lib/validations/schedule";
import { desc, eq, sql, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.PATIENT_SCHEDULE_READ
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const patientId = searchParams.get("patientId");
    const shiftId = searchParams.get("shiftId");
    const status = searchParams.get("status");
    const offset = (page - 1) * limit;

    const conditions = [];

    if (startDate) {
      conditions.push(gte(patientSchedule.scheduleDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(patientSchedule.scheduleDate, new Date(endDate)));
    }
    if (patientId) {
      conditions.push(eq(patientSchedule.patientId, patientId));
    }
    if (shiftId) {
      conditions.push(eq(patientSchedule.shiftId, shiftId));
    }
    if (status) {
      conditions.push(eq(patientSchedule.status, status));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Subquery untuk nama perawat
    const nurseUser = db
      .select({ id: nurse.id, name: user.name })
      .from(nurse)
      .innerJoin(user, eq(nurse.userId, user.id))
      .as("nurseUser");

    const [schedules, countResult] = await Promise.all([
      db
        .select({
          id: patientSchedule.id,
          patientId: patientSchedule.patientId,
          shiftId: patientSchedule.shiftId,
          scheduleDate: patientSchedule.scheduleDate,
          roomId: patientSchedule.roomId,
          machineId: patientSchedule.machineId,
          nurseId: patientSchedule.nurseId,
          status: patientSchedule.status,
          notes: patientSchedule.notes,
          createdAt: patientSchedule.createdAt,
          patientName: patient.name,
          patientMrn: patient.medicalRecordNumber,
          shiftName: shift.name,
          shiftStartTime: shift.startTime,
          shiftEndTime: shift.endTime,
          roomName: room.name,
          roomCode: room.code,
          machineSerial: hdMachine.serialNumber,
          machineBrand: hdMachine.brand,
          nurseName: nurseUser.name,
        })
        .from(patientSchedule)
        .innerJoin(patient, eq(patientSchedule.patientId, patient.id))
        .innerJoin(shift, eq(patientSchedule.shiftId, shift.id))
        .leftJoin(room, eq(patientSchedule.roomId, room.id))
        .leftJoin(hdMachine, eq(patientSchedule.machineId, hdMachine.id))
        .leftJoin(nurseUser, eq(patientSchedule.nurseId, nurseUser.id))
        .where(whereClause)
        .orderBy(desc(patientSchedule.scheduleDate), desc(patientSchedule.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(patientSchedule)
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
    console.error("Error fetching patient schedules:", error);
    return serverErrorResponse("Gagal memuat jadwal pasien");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.PATIENT_SCHEDULE_CREATE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createPatientScheduleSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const newSchedule = await db
      .insert(patientSchedule)
      .values({
        patientId: data.patientId,
        shiftId: data.shiftId,
        scheduleDate: new Date(data.scheduleDate),
        roomId: data.roomId || null,
        machineId: data.machineId || null,
        nurseId: data.nurseId || null,
        status: data.status,
        notes: data.notes || null,
      })
      .returning();

    // Get full schedule data with joins
    const nurseUser = db
      .select({ id: nurse.id, name: user.name })
      .from(nurse)
      .innerJoin(user, eq(nurse.userId, user.id))
      .as("nurseUser");

    const fullSchedule = await db
      .select({
        id: patientSchedule.id,
        patientId: patientSchedule.patientId,
        shiftId: patientSchedule.shiftId,
        scheduleDate: patientSchedule.scheduleDate,
        roomId: patientSchedule.roomId,
        machineId: patientSchedule.machineId,
        nurseId: patientSchedule.nurseId,
        status: patientSchedule.status,
        notes: patientSchedule.notes,
        createdAt: patientSchedule.createdAt,
        patientName: patient.name,
        patientMrn: patient.medicalRecordNumber,
        shiftName: shift.name,
        shiftStartTime: shift.startTime,
        shiftEndTime: shift.endTime,
        roomName: room.name,
        roomCode: room.code,
        machineSerial: hdMachine.serialNumber,
        machineBrand: hdMachine.brand,
        nurseName: nurseUser.name,
      })
      .from(patientSchedule)
      .innerJoin(patient, eq(patientSchedule.patientId, patient.id))
      .innerJoin(shift, eq(patientSchedule.shiftId, shift.id))
      .leftJoin(room, eq(patientSchedule.roomId, room.id))
      .leftJoin(hdMachine, eq(patientSchedule.machineId, hdMachine.id))
      .leftJoin(nurseUser, eq(patientSchedule.nurseId, nurseUser.id))
      .where(eq(patientSchedule.id, newSchedule[0].id))
      .limit(1);

    return successResponse(fullSchedule[0], undefined, 201);
  } catch (error) {
    console.error("Error creating patient schedule:", error);
    if (
      error instanceof Error &&
      error.message.includes("unique constraint")
    ) {
      return serverErrorResponse(
        "Jadwal untuk pasien ini di shift dan tanggal yang sama sudah ada"
      );
    }
    return serverErrorResponse("Gagal membuat jadwal pasien");
  }
}
