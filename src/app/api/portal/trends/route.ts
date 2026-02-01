import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hdSession, patientLabResult, patient, patientSchedule, shift } from "@/db/schema";
import { requireAuth } from "@/lib/api/auth";
import {
  successResponse,
  serverErrorResponse,
  forbiddenResponse,
} from "@/lib/api/response";
import { hasRole, ROLE_NAMES } from "@/lib/permissions";
import { eq, desc, and, gte } from "drizzle-orm";

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
      .select({ id: patient.id, dryWeight: patient.dryWeight })
      .from(patient)
      .where(eq(patient.userId, session.user.id))
      .limit(1);

    if (!patientRecord[0]) {
      return forbiddenResponse("Data pasien tidak ditemukan");
    }

    const patientId = patientRecord[0].id;

    const { searchParams } = new URL(request.url);
    const sessionsLimit = parseInt(searchParams.get("sessionsLimit") || "10");
    const labsLimit = parseInt(searchParams.get("labsLimit") || "5");

    // Get last N sessions for trends (weight, BP, UF)
    const sessions = await db
      .select({
        id: hdSession.id,
        sessionDate: hdSession.sessionDate,
        preWeight: hdSession.preWeight,
        postWeight: hdSession.postWeight,
        preSystolic: hdSession.preSystolic,
        preDiastolic: hdSession.preDiastolic,
        postSystolic: hdSession.postSystolic,
        postDiastolic: hdSession.postDiastolic,
        prePulse: hdSession.prePulse,
        postPulse: hdSession.postPulse,
        ufGoal: hdSession.ufGoal,
        actualUf: hdSession.actualUf,
        duration: hdSession.duration,
        status: hdSession.status,
      })
      .from(hdSession)
      .where(
        and(
          eq(hdSession.patientId, patientId),
          eq(hdSession.status, "completed")
        )
      )
      .orderBy(desc(hdSession.sessionDate))
      .limit(sessionsLimit);

    // Get last N lab results for trends
    const labs = await db
      .select({
        id: patientLabResult.id,
        testDate: patientLabResult.testDate,
        hemoglobin: patientLabResult.hemoglobin,
        ureum: patientLabResult.ureum,
        creatinine: patientLabResult.creatinine,
        potassium: patientLabResult.potassium,
        sodium: patientLabResult.sodium,
        calcium: patientLabResult.calcium,
        phosphorus: patientLabResult.phosphorus,
        albumin: patientLabResult.albumin,
        ktv: patientLabResult.ktv,
        urr: patientLabResult.urr,
      })
      .from(patientLabResult)
      .where(eq(patientLabResult.patientId, patientId))
      .orderBy(desc(patientLabResult.testDate))
      .limit(labsLimit);

    // Get upcoming schedules
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingSchedules = await db
      .select({
        id: patientSchedule.id,
        scheduleDate: patientSchedule.scheduleDate,
        status: patientSchedule.status,
        shiftName: shift.name,
        shiftStartTime: shift.startTime,
        shiftEndTime: shift.endTime,
      })
      .from(patientSchedule)
      .innerJoin(shift, eq(patientSchedule.shiftId, shift.id))
      .where(
        and(
          eq(patientSchedule.patientId, patientId),
          gte(patientSchedule.scheduleDate, today)
        )
      )
      .orderBy(patientSchedule.scheduleDate)
      .limit(5);

    // Reverse sessions and labs to show chronological order for charts
    const sessionsChronological = [...sessions].reverse();
    const labsChronological = [...labs].reverse();

    // Calculate averages and trends
    const completedSessions = sessionsChronological.filter(
      (s) => s.preWeight && s.postWeight
    );

    const avgPreWeight =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + (s.preWeight || 0), 0) /
              completedSessions.length
          )
        : null;

    const avgPostWeight =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + (s.postWeight || 0), 0) /
              completedSessions.length
          )
        : null;

    const avgUf =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + (s.actualUf || 0), 0) /
              completedSessions.length
          )
        : null;

    return successResponse({
      dryWeight: patientRecord[0].dryWeight,
      sessions: sessionsChronological,
      labs: labsChronological,
      upcomingSchedules,
      averages: {
        preWeight: avgPreWeight,
        postWeight: avgPostWeight,
        actualUf: avgUf,
      },
    });
  } catch (error) {
    console.error("Error fetching patient trends:", error);
    return serverErrorResponse("Gagal memuat data tren");
  }
}
