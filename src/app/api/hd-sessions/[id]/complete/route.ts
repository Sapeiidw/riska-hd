import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hdSession, patientSchedule } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  notFoundResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { completeHdSessionSchema } from "@/lib/validations/hd-session";
import { eq } from "drizzle-orm";

export async function POST(
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

    // Cek sesi ada dan masih in_progress
    const existingSession = await db
      .select()
      .from(hdSession)
      .where(eq(hdSession.id, id))
      .limit(1);

    if (!existingSession[0]) {
      return notFoundResponse("Sesi HD tidak ditemukan");
    }

    if (existingSession[0].status === "completed") {
      return serverErrorResponse("Sesi HD sudah selesai");
    }

    const body = await request.json();
    const validation = completeHdSessionSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    // Update sesi dengan data pasca-HD dan selesaikan
    const completedSession = await db
      .update(hdSession)
      .set({
        postWeight: data.postWeight,
        postSystolic: data.postSystolic,
        postDiastolic: data.postDiastolic,
        postPulse: data.postPulse,
        actualUf: data.actualUf,
        postNotes: data.postNotes,
        endTime: new Date(data.endTime),
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(hdSession.id, id))
      .returning();

    // Update status jadwal pasien menjadi completed
    await db
      .update(patientSchedule)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(patientSchedule.id, existingSession[0].patientScheduleId));

    return successResponse(completedSession[0]);
  } catch (error) {
    console.error("Error completing HD session:", error);
    return serverErrorResponse("Gagal menyelesaikan sesi HD");
  }
}
