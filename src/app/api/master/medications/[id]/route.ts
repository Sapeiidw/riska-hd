import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { medication } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateMedicationSchema } from "@/lib/validations/medical";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.MEDICATION_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const result = await db.select().from(medication).where(eq(medication.id, id)).limit(1);

    if (result.length === 0) {
      return notFoundResponse("Medication not found");
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching medication:", error);
    return serverErrorResponse("Failed to fetch medication");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.MEDICATION_UPDATE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateMedicationSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const updated = await db
      .update(medication)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.genericName !== undefined && { genericName: data.genericName }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.unit && { unit: data.unit }),
        ...(data.defaultDosage !== undefined && { defaultDosage: data.defaultDosage }),
        ...(data.route !== undefined && { route: data.route }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updatedAt: new Date(),
      })
      .where(eq(medication.id, id))
      .returning();

    if (updated.length === 0) {
      return notFoundResponse("Medication not found");
    }

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating medication:", error);
    return serverErrorResponse("Failed to update medication");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.MEDICATION_DELETE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const deleted = await db
      .update(medication)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(medication.id, id))
      .returning();

    if (deleted.length === 0) {
      return notFoundResponse("Medication not found");
    }

    return successResponse({ message: "Medication deleted successfully" });
  } catch (error) {
    console.error("Error deleting medication:", error);
    return serverErrorResponse("Failed to delete medication");
  }
}
