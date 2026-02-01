import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { patient } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { updatePatientSchema } from "@/lib/validations/patient";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.PATIENT_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(patient)
      .where(eq(patient.id, id))
      .limit(1);

    if (result.length === 0) {
      return notFoundResponse("Patient not found");
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching patient:", error);
    return serverErrorResponse("Failed to fetch patient");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.PATIENT_UPDATE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updatePatientSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const updated = await db
      .update(patient)
      .set({
        ...(data.medicalRecordNumber && { medicalRecordNumber: data.medicalRecordNumber }),
        ...(data.name && { name: data.name }),
        ...(data.nik !== undefined && { nik: data.nik }),
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
        ...(data.gender && { gender: data.gender }),
        ...(data.bloodType !== undefined && { bloodType: data.bloodType }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.province !== undefined && { province: data.province }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.emergencyContactName !== undefined && { emergencyContactName: data.emergencyContactName }),
        ...(data.emergencyContactPhone !== undefined && { emergencyContactPhone: data.emergencyContactPhone }),
        ...(data.emergencyContactRelation !== undefined && { emergencyContactRelation: data.emergencyContactRelation }),
        ...(data.primaryDiagnosis !== undefined && { primaryDiagnosis: data.primaryDiagnosis }),
        ...(data.hdStartDate !== undefined && { hdStartDate: data.hdStartDate ? new Date(data.hdStartDate) : null }),
        ...(data.vascularAccessType !== undefined && { vascularAccessType: data.vascularAccessType }),
        ...(data.vascularAccessSite !== undefined && { vascularAccessSite: data.vascularAccessSite }),
        ...(data.dryWeight !== undefined && { dryWeight: data.dryWeight }),
        ...(data.insuranceType !== undefined && { insuranceType: data.insuranceType }),
        ...(data.insuranceNumber !== undefined && { insuranceNumber: data.insuranceNumber }),
        ...(data.primaryDoctorId !== undefined && { primaryDoctorId: data.primaryDoctorId }),
        updatedAt: new Date(),
      })
      .where(eq(patient.id, id))
      .returning();

    if (updated.length === 0) {
      return notFoundResponse("Patient not found");
    }

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating patient:", error);
    return serverErrorResponse("Failed to update patient");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.PATIENT_DELETE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    // Soft delete by setting isActive to false
    const deleted = await db
      .update(patient)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(patient.id, id))
      .returning();

    if (deleted.length === 0) {
      return notFoundResponse("Patient not found");
    }

    return successResponse({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return serverErrorResponse("Failed to delete patient");
  }
}
