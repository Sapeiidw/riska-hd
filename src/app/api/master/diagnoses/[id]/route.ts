import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { diagnosis } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateDiagnosisSchema } from "@/lib/validations/medical";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.DIAGNOSIS_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const result = await db.select().from(diagnosis).where(eq(diagnosis.id, id)).limit(1);

    if (result.length === 0) {
      return notFoundResponse("Diagnosis not found");
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching diagnosis:", error);
    return serverErrorResponse("Failed to fetch diagnosis");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.DIAGNOSIS_UPDATE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateDiagnosisSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const updated = await db
      .update(diagnosis)
      .set({
        ...(data.icdCode !== undefined && { icdCode: data.icdCode }),
        ...(data.name && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.description !== undefined && { description: data.description }),
        updatedAt: new Date(),
      })
      .where(eq(diagnosis.id, id))
      .returning();

    if (updated.length === 0) {
      return notFoundResponse("Diagnosis not found");
    }

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating diagnosis:", error);
    return serverErrorResponse("Failed to update diagnosis");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.DIAGNOSIS_DELETE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const deleted = await db
      .update(diagnosis)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(diagnosis.id, id))
      .returning();

    if (deleted.length === 0) {
      return notFoundResponse("Diagnosis not found");
    }

    return successResponse({ message: "Diagnosis deleted successfully" });
  } catch (error) {
    console.error("Error deleting diagnosis:", error);
    return serverErrorResponse("Failed to delete diagnosis");
  }
}
