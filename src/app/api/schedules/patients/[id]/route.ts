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
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { updatePatientScheduleSchema } from "@/lib/validations/schedule";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.PATIENT_SCHEDULE_READ
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const nurseUser = db
      .select({ id: nurse.id, name: user.name })
      .from(nurse)
      .innerJoin(user, eq(nurse.userId, user.id))
      .as("nurseUser");

    const result = await db
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
      .where(eq(patientSchedule.id, id))
      .limit(1);

    if (result.length === 0) {
      return notFoundResponse("Jadwal pasien tidak ditemukan");
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching patient schedule:", error);
    return serverErrorResponse("Gagal memuat jadwal pasien");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.PATIENT_SCHEDULE_UPDATE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updatePatientScheduleSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const existing = await db
      .select()
      .from(patientSchedule)
      .where(eq(patientSchedule.id, id))
      .limit(1);

    if (existing.length === 0) {
      return notFoundResponse("Jadwal pasien tidak ditemukan");
    }

    await db
      .update(patientSchedule)
      .set({
        patientId: data.patientId ?? existing[0].patientId,
        shiftId: data.shiftId ?? existing[0].shiftId,
        scheduleDate: data.scheduleDate
          ? new Date(data.scheduleDate)
          : existing[0].scheduleDate,
        roomId: data.roomId !== undefined ? data.roomId : existing[0].roomId,
        machineId:
          data.machineId !== undefined ? data.machineId : existing[0].machineId,
        nurseId:
          data.nurseId !== undefined ? data.nurseId : existing[0].nurseId,
        status: data.status ?? existing[0].status,
        notes: data.notes !== undefined ? data.notes : existing[0].notes,
        updatedAt: new Date(),
      })
      .where(eq(patientSchedule.id, id));

    const nurseUser = db
      .select({ id: nurse.id, name: user.name })
      .from(nurse)
      .innerJoin(user, eq(nurse.userId, user.id))
      .as("nurseUser");

    const updated = await db
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
      .where(eq(patientSchedule.id, id))
      .limit(1);

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating patient schedule:", error);
    if (
      error instanceof Error &&
      error.message.includes("unique constraint")
    ) {
      return serverErrorResponse(
        "Jadwal untuk pasien ini di shift dan tanggal yang sama sudah ada"
      );
    }
    return serverErrorResponse("Gagal memperbarui jadwal pasien");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.PATIENT_SCHEDULE_DELETE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const existing = await db
      .select()
      .from(patientSchedule)
      .where(eq(patientSchedule.id, id))
      .limit(1);

    if (existing.length === 0) {
      return notFoundResponse("Jadwal pasien tidak ditemukan");
    }

    await db.delete(patientSchedule).where(eq(patientSchedule.id, id));

    return successResponse({ message: "Jadwal pasien berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting patient schedule:", error);
    return serverErrorResponse("Gagal menghapus jadwal pasien");
  }
}
