import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  hdSession,
  patient,
  patientSchedule,
  nurse,
  user,
  hdMachine,
  shift,
  room,
} from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import { successResponse, serverErrorResponse } from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { eq, and, gte, lte, sql, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.HD_SESSION_READ
  );
  if ("error" in authResult) return authResult.error;

  try {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Subquery untuk nama perawat
    const nurseUser = db
      .select({ id: nurse.id, name: user.name })
      .from(nurse)
      .innerJoin(user, eq(nurse.userId, user.id))
      .as("nurseUser");

    // Get active sessions (in_progress) or today's sessions
    const sessions = await db
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
        postWeight: hdSession.postWeight,
        postSystolic: hdSession.postSystolic,
        postDiastolic: hdSession.postDiastolic,
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
        shiftStartTime: shift.startTime,
        shiftEndTime: shift.endTime,
        roomName: room.name,
        roomCode: room.code,
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
      .where(
        or(
          eq(hdSession.status, "in_progress"),
          and(
            gte(hdSession.sessionDate, startOfDay),
            lte(hdSession.sessionDate, endOfDay)
          )
        )
      )
      .orderBy(hdSession.startTime);

    // Get today's schedules that don't have sessions yet
    const schedulesWithoutSession = await db
      .select({
        id: patientSchedule.id,
        patientId: patientSchedule.patientId,
        shiftId: patientSchedule.shiftId,
        scheduleDate: patientSchedule.scheduleDate,
        roomId: patientSchedule.roomId,
        machineId: patientSchedule.machineId,
        nurseId: patientSchedule.nurseId,
        status: patientSchedule.status,
        patientName: patient.name,
        patientMrn: patient.medicalRecordNumber,
        patientDryWeight: patient.dryWeight,
        shiftName: shift.name,
        shiftStartTime: shift.startTime,
        shiftEndTime: shift.endTime,
        roomName: room.name,
        nurseName: nurseUser.name,
        machineBrand: hdMachine.brand,
        machineSerial: hdMachine.serialNumber,
      })
      .from(patientSchedule)
      .innerJoin(patient, eq(patientSchedule.patientId, patient.id))
      .innerJoin(shift, eq(patientSchedule.shiftId, shift.id))
      .leftJoin(room, eq(patientSchedule.roomId, room.id))
      .leftJoin(nurseUser, eq(patientSchedule.nurseId, nurseUser.id))
      .leftJoin(hdMachine, eq(patientSchedule.machineId, hdMachine.id))
      .where(
        and(
          gte(patientSchedule.scheduleDate, startOfDay),
          lte(patientSchedule.scheduleDate, endOfDay),
          or(
            eq(patientSchedule.status, "scheduled"),
            eq(patientSchedule.status, "confirmed")
          )
        )
      )
      .orderBy(shift.startTime);

    return successResponse({
      activeSessions: sessions.filter((s) => s.status === "in_progress"),
      completedToday: sessions.filter((s) => s.status === "completed"),
      pendingSchedules: schedulesWithoutSession,
    });
  } catch (error) {
    console.error("Error fetching active HD sessions:", error);
    return serverErrorResponse("Gagal memuat data sesi aktif");
  }
}
