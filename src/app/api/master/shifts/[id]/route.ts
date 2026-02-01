import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { shift } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateShiftSchema } from "@/lib/validations/facility";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.SHIFT_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const result = await db.select().from(shift).where(eq(shift.id, id)).limit(1);

    if (result.length === 0) {
      return notFoundResponse("Shift not found");
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching shift:", error);
    return serverErrorResponse("Failed to fetch shift");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.SHIFT_UPDATE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateShiftSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const updated = await db
      .update(shift)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...(data.maxPatients !== undefined && { maxPatients: data.maxPatients }),
        updatedAt: new Date(),
      })
      .where(eq(shift.id, id))
      .returning();

    if (updated.length === 0) {
      return notFoundResponse("Shift not found");
    }

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating shift:", error);
    return serverErrorResponse("Failed to update shift");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.SHIFT_DELETE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const deleted = await db
      .update(shift)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(shift.id, id))
      .returning();

    if (deleted.length === 0) {
      return notFoundResponse("Shift not found");
    }

    return successResponse({ message: "Shift deleted successfully" });
  } catch (error) {
    console.error("Error deleting shift:", error);
    return serverErrorResponse("Failed to delete shift");
  }
}
