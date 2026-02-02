import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hdSession,
  hdSessionComplication,
  hdSessionMedication,
  patient,
  patientSchedule,
  shift,
  room,
  hdMachine,
  complication,
  medication,
  nurse,
  user,
} from "@/db/schema";
import { requireAuth } from "@/lib/api/auth";
import {
  serverErrorResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/api/response";
import { hasRole, ROLE_NAMES } from "@/lib/permissions";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { session: authSession } = authResult;
    const { id } = await params;

    // Pastikan user adalah pasien
    if (!hasRole(authSession.user as { role?: string | null }, ROLE_NAMES.PASIEN)) {
      return forbiddenResponse("Akses hanya untuk pasien");
    }

    // Get patient ID
    const patientRecord = await db
      .select({ id: patient.id })
      .from(patient)
      .where(eq(patient.userId, authSession.user.id))
      .limit(1);

    if (!patientRecord[0]) {
      return forbiddenResponse("Data pasien tidak ditemukan");
    }

    const patientId = patientRecord[0].id;

    // Get basic session data first
    const basicSession = await db
      .select({
        id: hdSession.id,
        sessionDate: hdSession.sessionDate,
        startTime: hdSession.startTime,
        endTime: hdSession.endTime,
        patientScheduleId: hdSession.patientScheduleId,
        machineId: hdSession.machineId,
        recordedByNurseId: hdSession.recordedByNurseId,
        preWeight: hdSession.preWeight,
        preSystolic: hdSession.preSystolic,
        preDiastolic: hdSession.preDiastolic,
        prePulse: hdSession.prePulse,
        preTemperature: hdSession.preTemperature,
        preComplaints: hdSession.preComplaints,
        ufGoal: hdSession.ufGoal,
        bloodFlow: hdSession.bloodFlow,
        dialysateFlow: hdSession.dialysateFlow,
        tmp: hdSession.tmp,
        duration: hdSession.duration,
        vascularAccess: hdSession.vascularAccess,
        vascularAccessSite: hdSession.vascularAccessSite,
        dialyzerType: hdSession.dialyzerType,
        dialyzerReuse: hdSession.dialyzerReuse,
        anticoagulant: hdSession.anticoagulant,
        anticoagulantDose: hdSession.anticoagulantDose,
        dialysateType: hdSession.dialysateType,
        dialysateTemperature: hdSession.dialysateTemperature,
        postWeight: hdSession.postWeight,
        postSystolic: hdSession.postSystolic,
        postDiastolic: hdSession.postDiastolic,
        postPulse: hdSession.postPulse,
        actualUf: hdSession.actualUf,
        postNotes: hdSession.postNotes,
        status: hdSession.status,
        createdAt: hdSession.createdAt,
      })
      .from(hdSession)
      .where(and(eq(hdSession.id, id), eq(hdSession.patientId, patientId)))
      .limit(1);

    if (!basicSession[0]) {
      return notFoundResponse("Sesi tidak ditemukan");
    }

    const s = basicSession[0];

    // Get schedule info
    let shiftName: string | null = null;
    let roomName: string | null = null;
    if (s.patientScheduleId) {
      const scheduleInfo = await db
        .select({
          shiftName: shift.name,
          roomName: room.name,
        })
        .from(patientSchedule)
        .innerJoin(shift, eq(patientSchedule.shiftId, shift.id))
        .leftJoin(room, eq(patientSchedule.roomId, room.id))
        .where(eq(patientSchedule.id, s.patientScheduleId))
        .limit(1);

      if (scheduleInfo[0]) {
        shiftName = scheduleInfo[0].shiftName;
        roomName = scheduleInfo[0].roomName;
      }
    }

    // Get machine info
    let machineBrand: string | null = null;
    let machineModel: string | null = null;
    if (s.machineId) {
      const machineInfo = await db
        .select({
          brand: hdMachine.brand,
          model: hdMachine.model,
        })
        .from(hdMachine)
        .where(eq(hdMachine.id, s.machineId))
        .limit(1);

      if (machineInfo[0]) {
        machineBrand = machineInfo[0].brand;
        machineModel = machineInfo[0].model;
      }
    }

    // Get nurse info
    let nurseName: string | null = null;
    if (s.recordedByNurseId) {
      const nurseInfo = await db
        .select({ name: user.name })
        .from(nurse)
        .innerJoin(user, eq(nurse.userId, user.id))
        .where(eq(nurse.id, s.recordedByNurseId))
        .limit(1);

      if (nurseInfo[0]) {
        nurseName = nurseInfo[0].name;
      }
    }

    // Get complications
    const complicationsData = await db
      .select({
        id: hdSessionComplication.id,
        occurredAt: hdSessionComplication.occurredAt,
        action: hdSessionComplication.action,
        notes: hdSessionComplication.notes,
        resolvedAt: hdSessionComplication.resolvedAt,
        complicationName: complication.name,
        complicationCategory: complication.category,
      })
      .from(hdSessionComplication)
      .innerJoin(complication, eq(hdSessionComplication.complicationId, complication.id))
      .where(eq(hdSessionComplication.hdSessionId, id));

    // Get medications
    const medicationsData = await db
      .select({
        id: hdSessionMedication.id,
        dosage: hdSessionMedication.dosage,
        route: hdSessionMedication.route,
        administeredAt: hdSessionMedication.administeredAt,
        notes: hdSessionMedication.notes,
        medicationName: medication.name,
        medicationUnit: medication.unit,
      })
      .from(hdSessionMedication)
      .innerJoin(medication, eq(hdSessionMedication.medicationId, medication.id))
      .where(eq(hdSessionMedication.hdSessionId, id));

    // Build plain object response
    const responseData = {
      success: true,
      data: {
        id: s.id,
        sessionDate: s.sessionDate ? s.sessionDate.toISOString() : null,
        startTime: s.startTime ? s.startTime.toISOString() : null,
        endTime: s.endTime ? s.endTime.toISOString() : null,
        preWeight: s.preWeight,
        preSystolic: s.preSystolic,
        preDiastolic: s.preDiastolic,
        prePulse: s.prePulse,
        preTemperature: s.preTemperature,
        preComplaints: s.preComplaints,
        ufGoal: s.ufGoal,
        bloodFlow: s.bloodFlow,
        dialysateFlow: s.dialysateFlow,
        tmp: s.tmp,
        duration: s.duration,
        vascularAccess: s.vascularAccess,
        vascularAccessSite: s.vascularAccessSite,
        dialyzerType: s.dialyzerType,
        dialyzerReuse: s.dialyzerReuse,
        anticoagulant: s.anticoagulant,
        anticoagulantDose: s.anticoagulantDose,
        dialysateType: s.dialysateType,
        dialysateTemperature: s.dialysateTemperature,
        postWeight: s.postWeight,
        postSystolic: s.postSystolic,
        postDiastolic: s.postDiastolic,
        postPulse: s.postPulse,
        actualUf: s.actualUf,
        postNotes: s.postNotes,
        status: s.status,
        createdAt: s.createdAt ? s.createdAt.toISOString() : null,
        shiftName,
        roomName,
        machineBrand,
        machineModel,
        nurseName,
        complications: complicationsData.map((c) => ({
          id: c.id,
          occurredAt: c.occurredAt ? c.occurredAt.toISOString() : null,
          action: c.action,
          notes: c.notes,
          resolvedAt: c.resolvedAt ? c.resolvedAt.toISOString() : null,
          complicationName: c.complicationName,
          complicationCategory: c.complicationCategory,
        })),
        medications: medicationsData.map((m) => ({
          id: m.id,
          dosage: m.dosage,
          route: m.route,
          administeredAt: m.administeredAt ? m.administeredAt.toISOString() : null,
          notes: m.notes,
          medicationName: m.medicationName,
          medicationUnit: m.medicationUnit,
        })),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching session detail:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return serverErrorResponse("Gagal memuat detail sesi");
  }
}
