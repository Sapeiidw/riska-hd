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
  hdSessionComplication,
  hdSessionMedication,
  complication,
  medication,
} from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  notFoundResponse,
  forbiddenResponse,
} from "@/lib/api/response";
import { PERMISSIONS, hasRole, ROLE_NAMES } from "@/lib/permissions";
import { updateHdSessionSchema } from "@/lib/validations/hd-session";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.HD_SESSION_READ
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;
    const { id } = await params;

    // Subquery untuk nama perawat
    const nurseUser = db
      .select({ id: nurse.id, name: user.name })
      .from(nurse)
      .innerJoin(user, eq(nurse.userId, user.id))
      .as("nurseUser");

    const sessionData = await db
      .select({
        id: hdSession.id,
        patientScheduleId: hdSession.patientScheduleId,
        patientId: hdSession.patientId,
        sessionDate: hdSession.sessionDate,
        startTime: hdSession.startTime,
        endTime: hdSession.endTime,
        // Pra-HD
        preWeight: hdSession.preWeight,
        preSystolic: hdSession.preSystolic,
        preDiastolic: hdSession.preDiastolic,
        prePulse: hdSession.prePulse,
        preTemperature: hdSession.preTemperature,
        preComplaints: hdSession.preComplaints,
        // HD Parameters
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
        machineId: hdSession.machineId,
        hdProtocolId: hdSession.hdProtocolId,
        // Pasca-HD
        postWeight: hdSession.postWeight,
        postSystolic: hdSession.postSystolic,
        postDiastolic: hdSession.postDiastolic,
        postPulse: hdSession.postPulse,
        actualUf: hdSession.actualUf,
        postNotes: hdSession.postNotes,
        // Status
        status: hdSession.status,
        recordedByNurseId: hdSession.recordedByNurseId,
        createdAt: hdSession.createdAt,
        updatedAt: hdSession.updatedAt,
        // Relations
        patientName: patient.name,
        patientMrn: patient.medicalRecordNumber,
        patientDryWeight: patient.dryWeight,
        patientVascularAccessType: patient.vascularAccessType,
        patientVascularAccessSite: patient.vascularAccessSite,
        nurseName: nurseUser.name,
        shiftName: shift.name,
        shiftStartTime: shift.startTime,
        shiftEndTime: shift.endTime,
        roomName: room.name,
        roomCode: room.code,
        machineBrand: hdMachine.brand,
        machineModel: hdMachine.model,
        machineSerial: hdMachine.serialNumber,
        protocolName: hdProtocol.name,
      })
      .from(hdSession)
      .innerJoin(patient, eq(hdSession.patientId, patient.id))
      .innerJoin(patientSchedule, eq(hdSession.patientScheduleId, patientSchedule.id))
      .innerJoin(shift, eq(patientSchedule.shiftId, shift.id))
      .leftJoin(room, eq(patientSchedule.roomId, room.id))
      .leftJoin(nurseUser, eq(hdSession.recordedByNurseId, nurseUser.id))
      .leftJoin(hdMachine, eq(hdSession.machineId, hdMachine.id))
      .leftJoin(hdProtocol, eq(hdSession.hdProtocolId, hdProtocol.id))
      .where(eq(hdSession.id, id))
      .limit(1);

    if (!sessionData[0]) {
      return notFoundResponse("Sesi HD tidak ditemukan");
    }

    // Jika user adalah pasien, pastikan hanya bisa lihat datanya sendiri
    if (hasRole(session.user as { role?: string | null }, ROLE_NAMES.PASIEN)) {
      const patientRecord = await db
        .select({ id: patient.id })
        .from(patient)
        .where(eq(patient.userId, session.user.id))
        .limit(1);

      if (!patientRecord[0] || sessionData[0].patientId !== patientRecord[0].id) {
        return forbiddenResponse("Anda tidak memiliki akses ke data ini");
      }
    }

    // Get complications
    const complications = await db
      .select({
        id: hdSessionComplication.id,
        complicationId: hdSessionComplication.complicationId,
        occurredAt: hdSessionComplication.occurredAt,
        action: hdSessionComplication.action,
        notes: hdSessionComplication.notes,
        resolvedAt: hdSessionComplication.resolvedAt,
        complicationName: complication.name,
        complicationCode: complication.code,
        complicationSeverity: complication.severity,
      })
      .from(hdSessionComplication)
      .innerJoin(complication, eq(hdSessionComplication.complicationId, complication.id))
      .where(eq(hdSessionComplication.hdSessionId, id));

    // Get medications
    const medications = await db
      .select({
        id: hdSessionMedication.id,
        medicationId: hdSessionMedication.medicationId,
        dosage: hdSessionMedication.dosage,
        route: hdSessionMedication.route,
        administeredAt: hdSessionMedication.administeredAt,
        notes: hdSessionMedication.notes,
        medicationName: medication.name,
        medicationGenericName: medication.genericName,
      })
      .from(hdSessionMedication)
      .innerJoin(medication, eq(hdSessionMedication.medicationId, medication.id))
      .where(eq(hdSessionMedication.hdSessionId, id));

    return successResponse({
      ...sessionData[0],
      complications,
      medications,
    });
  } catch (error) {
    console.error("Error fetching HD session:", error);
    return serverErrorResponse("Gagal memuat data sesi HD");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.HD_SESSION_UPDATE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    // Cek sesi ada
    const existingSession = await db
      .select()
      .from(hdSession)
      .where(eq(hdSession.id, id))
      .limit(1);

    if (!existingSession[0]) {
      return notFoundResponse("Sesi HD tidak ditemukan");
    }

    const body = await request.json();
    const validation = updateHdSessionSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const updatedSession = await db
      .update(hdSession)
      .set({
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : existingSession[0].startTime,
        endTime: data.endTime ? new Date(data.endTime) : existingSession[0].endTime,
        updatedAt: new Date(),
      })
      .where(eq(hdSession.id, id))
      .returning();

    return successResponse(updatedSession[0]);
  } catch (error) {
    console.error("Error updating HD session:", error);
    return serverErrorResponse("Gagal mengupdate sesi HD");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.HD_SESSION_DELETE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const existingSession = await db
      .select()
      .from(hdSession)
      .where(eq(hdSession.id, id))
      .limit(1);

    if (!existingSession[0]) {
      return notFoundResponse("Sesi HD tidak ditemukan");
    }

    // Hapus sesi (cascades to complications and medications)
    await db.delete(hdSession).where(eq(hdSession.id, id));

    // Reset status jadwal pasien
    await db
      .update(patientSchedule)
      .set({ status: "confirmed", updatedAt: new Date() })
      .where(eq(patientSchedule.id, existingSession[0].patientScheduleId));

    return successResponse({ message: "Sesi HD berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting HD session:", error);
    return serverErrorResponse("Gagal menghapus sesi HD");
  }
}
