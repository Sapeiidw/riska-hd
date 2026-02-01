import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { patientLabResult, patient, user } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  notFoundResponse,
  forbiddenResponse,
} from "@/lib/api/response";
import { PERMISSIONS, hasRole, ROLE_NAMES } from "@/lib/permissions";
import { updatePatientLabResultSchema } from "@/lib/validations/patient-lab";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.PATIENT_LAB_READ
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;
    const { id } = await params;

    const labData = await db
      .select({
        id: patientLabResult.id,
        patientId: patientLabResult.patientId,
        testDate: patientLabResult.testDate,
        reportDate: patientLabResult.reportDate,
        hemoglobin: patientLabResult.hemoglobin,
        ureum: patientLabResult.ureum,
        creatinine: patientLabResult.creatinine,
        potassium: patientLabResult.potassium,
        sodium: patientLabResult.sodium,
        calcium: patientLabResult.calcium,
        phosphorus: patientLabResult.phosphorus,
        albumin: patientLabResult.albumin,
        uricAcid: patientLabResult.uricAcid,
        ktv: patientLabResult.ktv,
        urr: patientLabResult.urr,
        additionalLabs: patientLabResult.additionalLabs,
        labSource: patientLabResult.labSource,
        notes: patientLabResult.notes,
        enteredById: patientLabResult.enteredById,
        createdAt: patientLabResult.createdAt,
        updatedAt: patientLabResult.updatedAt,
        patientName: patient.name,
        patientMrn: patient.medicalRecordNumber,
        enteredByName: user.name,
      })
      .from(patientLabResult)
      .innerJoin(patient, eq(patientLabResult.patientId, patient.id))
      .leftJoin(user, eq(patientLabResult.enteredById, user.id))
      .where(eq(patientLabResult.id, id))
      .limit(1);

    if (!labData[0]) {
      return notFoundResponse("Data lab tidak ditemukan");
    }

    // Jika user adalah pasien, pastikan hanya bisa lihat datanya sendiri
    if (hasRole(session.user as { role?: string | null }, ROLE_NAMES.PASIEN)) {
      const patientRecord = await db
        .select({ id: patient.id })
        .from(patient)
        .where(eq(patient.userId, session.user.id))
        .limit(1);

      if (!patientRecord[0] || labData[0].patientId !== patientRecord[0].id) {
        return forbiddenResponse("Anda tidak memiliki akses ke data ini");
      }
    }

    return successResponse(labData[0]);
  } catch (error) {
    console.error("Error fetching patient lab:", error);
    return serverErrorResponse("Gagal memuat data lab");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.PATIENT_LAB_UPDATE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    // Cek data lab ada
    const existingLab = await db
      .select()
      .from(patientLabResult)
      .where(eq(patientLabResult.id, id))
      .limit(1);

    if (!existingLab[0]) {
      return notFoundResponse("Data lab tidak ditemukan");
    }

    const body = await request.json();
    const validation = updatePatientLabResultSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const updatedLab = await db
      .update(patientLabResult)
      .set({
        testDate: data.testDate ? new Date(data.testDate) : existingLab[0].testDate,
        reportDate: data.reportDate ? new Date(data.reportDate) : existingLab[0].reportDate,
        hemoglobin: data.hemoglobin ?? existingLab[0].hemoglobin,
        ureum: data.ureum ?? existingLab[0].ureum,
        creatinine: data.creatinine ?? existingLab[0].creatinine,
        potassium: data.potassium ?? existingLab[0].potassium,
        sodium: data.sodium ?? existingLab[0].sodium,
        calcium: data.calcium ?? existingLab[0].calcium,
        phosphorus: data.phosphorus ?? existingLab[0].phosphorus,
        albumin: data.albumin ?? existingLab[0].albumin,
        uricAcid: data.uricAcid ?? existingLab[0].uricAcid,
        ktv: data.ktv ?? existingLab[0].ktv,
        urr: data.urr ?? existingLab[0].urr,
        additionalLabs: data.additionalLabs ?? existingLab[0].additionalLabs,
        labSource: data.labSource ?? existingLab[0].labSource,
        notes: data.notes ?? existingLab[0].notes,
        updatedAt: new Date(),
      })
      .where(eq(patientLabResult.id, id))
      .returning();

    return successResponse(updatedLab[0]);
  } catch (error) {
    console.error("Error updating patient lab:", error);
    return serverErrorResponse("Gagal mengupdate data lab");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.PATIENT_LAB_DELETE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const existingLab = await db
      .select()
      .from(patientLabResult)
      .where(eq(patientLabResult.id, id))
      .limit(1);

    if (!existingLab[0]) {
      return notFoundResponse("Data lab tidak ditemukan");
    }

    await db.delete(patientLabResult).where(eq(patientLabResult.id, id));

    return successResponse({ message: "Data lab berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting patient lab:", error);
    return serverErrorResponse("Gagal menghapus data lab");
  }
}
