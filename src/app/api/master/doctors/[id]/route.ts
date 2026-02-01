import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { doctor, user } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateDoctorSchema } from "@/lib/validations/staff";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.DOCTOR_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const result = await db
      .select({
        id: doctor.id,
        userId: doctor.userId,
        nip: doctor.nip,
        sip: doctor.sip,
        specialization: doctor.specialization,
        licenseExpiry: doctor.licenseExpiry,
        isActive: doctor.isActive,
        createdAt: doctor.createdAt,
        name: user.name,
        email: user.email,
      })
      .from(doctor)
      .innerJoin(user, eq(doctor.userId, user.id))
      .where(eq(doctor.id, id))
      .limit(1);

    if (result.length === 0) {
      return notFoundResponse("Doctor not found");
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return serverErrorResponse("Failed to fetch doctor");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.DOCTOR_UPDATE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateDoctorSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    // Get existing doctor
    const existingDoctor = await db
      .select()
      .from(doctor)
      .where(eq(doctor.id, id))
      .limit(1);

    if (existingDoctor.length === 0) {
      return notFoundResponse("Doctor not found");
    }

    // Update user if name or email changed
    if (data.name || data.email) {
      await db
        .update(user)
        .set({
          ...(data.name && { name: data.name }),
          ...(data.email && { email: data.email }),
          updatedAt: new Date(),
        })
        .where(eq(user.id, existingDoctor[0].userId));
    }

    // Update doctor
    const updatedDoctor = await db
      .update(doctor)
      .set({
        nip: data.nip !== undefined ? data.nip : existingDoctor[0].nip,
        sip: data.sip !== undefined ? data.sip : existingDoctor[0].sip,
        specialization:
          data.specialization !== undefined
            ? data.specialization
            : existingDoctor[0].specialization,
        licenseExpiry: data.licenseExpiry
          ? new Date(data.licenseExpiry)
          : existingDoctor[0].licenseExpiry,
        updatedAt: new Date(),
      })
      .where(eq(doctor.id, id))
      .returning();

    // Get updated user info
    const updatedUser = await db
      .select()
      .from(user)
      .where(eq(user.id, existingDoctor[0].userId))
      .limit(1);

    return successResponse({
      ...updatedDoctor[0],
      name: updatedUser[0].name,
      email: updatedUser[0].email,
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return serverErrorResponse("Failed to update doctor");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.DOCTOR_DELETE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const existingDoctor = await db
      .select()
      .from(doctor)
      .where(eq(doctor.id, id))
      .limit(1);

    if (existingDoctor.length === 0) {
      return notFoundResponse("Doctor not found");
    }

    // Soft delete - set isActive to false
    await db
      .update(doctor)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(doctor.id, id));

    return successResponse({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return serverErrorResponse("Failed to delete doctor");
  }
}
