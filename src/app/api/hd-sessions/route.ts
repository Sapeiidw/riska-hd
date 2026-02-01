import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  hdSession,
  patient,
  patientSchedule,
  nurse,
  user,
  hdMachine,
  hdProtocol,
  shift,
  room,
} from "@/db/schema";
import { requirePermission, getSession } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  forbiddenResponse,
} from "@/lib/api/response";
import { PERMISSIONS, hasRole, ROLE_NAMES } from "@/lib/permissions";
import { createHdSessionSchema } from "@/lib/validations/hd-session";
import { desc, eq, sql, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.HD_SESSION_READ
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const patientIdParam = searchParams.get("patientId");
    const status = searchParams.get("status");
    const offset = (page - 1) * limit;

    const conditions = [];

    // Jika user adalah pasien, hanya tampilkan data miliknya
    if (hasRole(session.user as { role?: string | null }, ROLE_NAMES.PASIEN)) {
      const patientRecord = await db
        .select({ id: patient.id })
        .from(patient)
        .where(eq(patient.userId, session.user.id))
        .limit(1);

      if (!patientRecord[0]) {
        return forbiddenResponse("Data pasien tidak ditemukan");
      }
      conditions.push(eq(hdSession.patientId, patientRecord[0].id));
    } else if (patientIdParam) {
      conditions.push(eq(hdSession.patientId, patientIdParam));
    }

    if (startDate) {
      conditions.push(gte(hdSession.sessionDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(hdSession.sessionDate, new Date(endDate)));
    }
    if (status) {
      conditions.push(eq(hdSession.status, status));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Subquery untuk nama perawat
    const nurseUser = db
      .select({ id: nurse.id, name: user.name })
      .from(nurse)
      .innerJoin(user, eq(nurse.userId, user.id))
      .as("nurseUser");

    const [sessions, countResult] = await Promise.all([
      db
        .select({
          id: hdSession.id,
          patientScheduleId: hdSession.patientScheduleId,
          patientId: hdSession.patientId,
          sessionDate: hdSession.sessionDate,
          startTime: hdSession.startTime,
          endTime: hdSession.endTime,
          preWeight: hdSession.preWeight,
          preSystolic: hdSession.preSystolic,
          preDiastolic: hdSession.preDiastolic,
          prePulse: hdSession.prePulse,
          preTemperature: hdSession.preTemperature,
          postWeight: hdSession.postWeight,
          postSystolic: hdSession.postSystolic,
          postDiastolic: hdSession.postDiastolic,
          postPulse: hdSession.postPulse,
          actualUf: hdSession.actualUf,
          ufGoal: hdSession.ufGoal,
          bloodFlow: hdSession.bloodFlow,
          dialysateFlow: hdSession.dialysateFlow,
          duration: hdSession.duration,
          status: hdSession.status,
          createdAt: hdSession.createdAt,
          patientName: patient.name,
          patientMrn: patient.medicalRecordNumber,
          nurseName: nurseUser.name,
          shiftName: shift.name,
          roomName: room.name,
          machineBrand: hdMachine.brand,
          machineSerial: hdMachine.serialNumber,
        })
        .from(hdSession)
        .innerJoin(patient, eq(hdSession.patientId, patient.id))
        .innerJoin(patientSchedule, eq(hdSession.patientScheduleId, patientSchedule.id))
        .innerJoin(shift, eq(patientSchedule.shiftId, shift.id))
        .leftJoin(room, eq(patientSchedule.roomId, room.id))
        .leftJoin(nurseUser, eq(hdSession.recordedByNurseId, nurseUser.id))
        .leftJoin(hdMachine, eq(hdSession.machineId, hdMachine.id))
        .where(whereClause)
        .orderBy(desc(hdSession.sessionDate), desc(hdSession.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(hdSession)
        .where(whereClause)
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(sessions, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching HD sessions:", error);
    return serverErrorResponse("Gagal memuat data sesi HD");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.HD_SESSION_CREATE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;

    // Hanya perawat dan admin yang bisa membuat sesi
    if (
      !hasRole(session.user as { role?: string | null }, ROLE_NAMES.PERAWAT) &&
      !hasRole(session.user as { role?: string | null }, ROLE_NAMES.ADMIN)
    ) {
      return forbiddenResponse("Hanya perawat yang dapat membuat sesi HD");
    }

    // Dapatkan nurse record
    const nurseRecord = await db
      .select({ id: nurse.id })
      .from(nurse)
      .where(eq(nurse.userId, session.user.id))
      .limit(1);

    if (!nurseRecord[0] && !hasRole(session.user as { role?: string | null }, ROLE_NAMES.ADMIN)) {
      return forbiddenResponse("Data perawat tidak ditemukan");
    }

    const body = await request.json();
    const validation = createHdSessionSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    // Cek jadwal pasien ada dan belum in_progress/completed
    const scheduleRecord = await db
      .select()
      .from(patientSchedule)
      .where(eq(patientSchedule.id, data.patientScheduleId))
      .limit(1);

    if (!scheduleRecord[0]) {
      return serverErrorResponse("Jadwal pasien tidak ditemukan");
    }

    if (scheduleRecord[0].status === "completed") {
      return serverErrorResponse("Jadwal pasien sudah selesai");
    }

    // Cek apakah sudah ada sesi untuk jadwal ini
    const existingSession = await db
      .select({ id: hdSession.id })
      .from(hdSession)
      .where(eq(hdSession.patientScheduleId, data.patientScheduleId))
      .limit(1);

    if (existingSession[0]) {
      return serverErrorResponse("Sesi HD untuk jadwal ini sudah ada");
    }

    // Buat sesi HD baru
    const newSession = await db
      .insert(hdSession)
      .values({
        patientScheduleId: data.patientScheduleId,
        patientId: data.patientId,
        sessionDate: new Date(data.sessionDate),
        startTime: data.startTime ? new Date(data.startTime) : new Date(),
        preWeight: data.preWeight,
        preSystolic: data.preSystolic,
        preDiastolic: data.preDiastolic,
        prePulse: data.prePulse,
        preTemperature: data.preTemperature,
        preComplaints: data.preComplaints,
        ufGoal: data.ufGoal,
        bloodFlow: data.bloodFlow,
        dialysateFlow: data.dialysateFlow,
        tmp: data.tmp,
        duration: data.duration,
        vascularAccess: data.vascularAccess,
        vascularAccessSite: data.vascularAccessSite,
        dialyzerType: data.dialyzerType,
        dialyzerReuse: data.dialyzerReuse,
        anticoagulant: data.anticoagulant,
        anticoagulantDose: data.anticoagulantDose,
        dialysateType: data.dialysateType,
        dialysateTemperature: data.dialysateTemperature,
        machineId: data.machineId,
        hdProtocolId: data.hdProtocolId,
        status: "in_progress",
        recordedByNurseId: nurseRecord[0]?.id || scheduleRecord[0].nurseId!,
      })
      .returning();

    // Update status jadwal pasien menjadi in_progress
    await db
      .update(patientSchedule)
      .set({ status: "in_progress", updatedAt: new Date() })
      .where(eq(patientSchedule.id, data.patientScheduleId));

    return successResponse(newSession[0], undefined, 201);
  } catch (error) {
    console.error("Error creating HD session:", error);
    return serverErrorResponse("Gagal membuat sesi HD");
  }
}
