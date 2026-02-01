import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  hdSession,
  patient,
  patientSchedule,
  shift,
  room,
  hdMachine,
} from "@/db/schema";
import { requireAuth } from "@/lib/api/auth";
import {
  successResponse,
  serverErrorResponse,
  forbiddenResponse,
} from "@/lib/api/response";
import { hasRole, ROLE_NAMES } from "@/lib/permissions";
import { eq, sql, desc, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;

    // Pastikan user adalah pasien
    if (!hasRole(session.user as { role?: string | null }, ROLE_NAMES.PASIEN)) {
      return forbiddenResponse("Akses hanya untuk pasien");
    }

    // Get patient ID
    const patientRecord = await db
      .select({ id: patient.id })
      .from(patient)
      .where(eq(patient.userId, session.user.id))
      .limit(1);

    if (!patientRecord[0]) {
      return forbiddenResponse("Data pasien tidak ditemukan");
    }

    const patientId = patientRecord[0].id;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const offset = (page - 1) * limit;

    const conditions = [eq(hdSession.patientId, patientId)];

    if (startDate) {
      conditions.push(gte(hdSession.sessionDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(hdSession.sessionDate, new Date(endDate)));
    }

    const whereClause = and(...conditions);

    const [sessions, countResult] = await Promise.all([
      db
        .select({
          id: hdSession.id,
          sessionDate: hdSession.sessionDate,
          startTime: hdSession.startTime,
          endTime: hdSession.endTime,
          // Pra-HD
          preWeight: hdSession.preWeight,
          preSystolic: hdSession.preSystolic,
          preDiastolic: hdSession.preDiastolic,
          prePulse: hdSession.prePulse,
          preTemperature: hdSession.preTemperature,
          // Pasca-HD
          postWeight: hdSession.postWeight,
          postSystolic: hdSession.postSystolic,
          postDiastolic: hdSession.postDiastolic,
          postPulse: hdSession.postPulse,
          actualUf: hdSession.actualUf,
          // HD Params
          ufGoal: hdSession.ufGoal,
          bloodFlow: hdSession.bloodFlow,
          dialysateFlow: hdSession.dialysateFlow,
          duration: hdSession.duration,
          dialyzerType: hdSession.dialyzerType,
          status: hdSession.status,
          // Relations
          shiftName: shift.name,
          roomName: room.name,
          machineBrand: hdMachine.brand,
        })
        .from(hdSession)
        .innerJoin(patientSchedule, eq(hdSession.patientScheduleId, patientSchedule.id))
        .innerJoin(shift, eq(patientSchedule.shiftId, shift.id))
        .leftJoin(room, eq(patientSchedule.roomId, room.id))
        .leftJoin(hdMachine, eq(hdSession.machineId, hdMachine.id))
        .where(whereClause)
        .orderBy(desc(hdSession.sessionDate))
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
    console.error("Error fetching patient sessions:", error);
    return serverErrorResponse("Gagal memuat riwayat sesi");
  }
}
