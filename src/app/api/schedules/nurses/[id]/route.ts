import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { nurseSchedule, nurse, user, shift, room } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateNurseScheduleSchema } from "@/lib/validations/schedule";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.NURSE_SCHEDULE_READ
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const result = await db
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
      .where(eq(nurseSchedule.id, id))
      .limit(1);

    if (result.length === 0) {
      return notFoundResponse("Jadwal perawat tidak ditemukan");
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching nurse schedule:", error);
    return serverErrorResponse("Gagal memuat jadwal perawat");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.NURSE_SCHEDULE_UPDATE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateNurseScheduleSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const existing = await db
      .select()
      .from(nurseSchedule)
      .where(eq(nurseSchedule.id, id))
      .limit(1);

    if (existing.length === 0) {
      return notFoundResponse("Jadwal perawat tidak ditemukan");
    }

    await db
      .update(nurseSchedule)
      .set({
        nurseId: data.nurseId ?? existing[0].nurseId,
        shiftId: data.shiftId ?? existing[0].shiftId,
        scheduleDate: data.scheduleDate
          ? new Date(data.scheduleDate)
          : existing[0].scheduleDate,
        roomId: data.roomId !== undefined ? data.roomId : existing[0].roomId,
        status: data.status ?? existing[0].status,
        notes: data.notes !== undefined ? data.notes : existing[0].notes,
        updatedAt: new Date(),
      })
      .where(eq(nurseSchedule.id, id));

    const updated = await db
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
      .where(eq(nurseSchedule.id, id))
      .limit(1);

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating nurse schedule:", error);
    if (
      error instanceof Error &&
      error.message.includes("unique constraint")
    ) {
      return serverErrorResponse(
        "Jadwal untuk perawat ini di shift dan tanggal yang sama sudah ada"
      );
    }
    return serverErrorResponse("Gagal memperbarui jadwal perawat");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.NURSE_SCHEDULE_DELETE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const existing = await db
      .select()
      .from(nurseSchedule)
      .where(eq(nurseSchedule.id, id))
      .limit(1);

    if (existing.length === 0) {
      return notFoundResponse("Jadwal perawat tidak ditemukan");
    }

    await db.delete(nurseSchedule).where(eq(nurseSchedule.id, id));

    return successResponse({ message: "Jadwal perawat berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting nurse schedule:", error);
    return serverErrorResponse("Gagal menghapus jadwal perawat");
  }
}
