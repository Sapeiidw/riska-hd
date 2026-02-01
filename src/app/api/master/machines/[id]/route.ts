import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hdMachine } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateHdMachineSchema } from "@/lib/validations/facility";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.HD_MACHINE_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const result = await db.select().from(hdMachine).where(eq(hdMachine.id, id)).limit(1);

    if (result.length === 0) {
      return notFoundResponse("Machine not found");
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching machine:", error);
    return serverErrorResponse("Failed to fetch machine");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.HD_MACHINE_UPDATE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateHdMachineSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const updated = await db
      .update(hdMachine)
      .set({
        ...(data.serialNumber && { serialNumber: data.serialNumber }),
        ...(data.brand && { brand: data.brand }),
        ...(data.model && { model: data.model }),
        ...(data.roomId !== undefined && { roomId: data.roomId }),
        ...(data.purchaseDate !== undefined && { purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null }),
        ...(data.lastMaintenanceDate !== undefined && { lastMaintenanceDate: data.lastMaintenanceDate ? new Date(data.lastMaintenanceDate) : null }),
        ...(data.nextMaintenanceDate !== undefined && { nextMaintenanceDate: data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : null }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updatedAt: new Date(),
      })
      .where(eq(hdMachine.id, id))
      .returning();

    if (updated.length === 0) {
      return notFoundResponse("Machine not found");
    }

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating machine:", error);
    return serverErrorResponse("Failed to update machine");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.HD_MACHINE_DELETE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const deleted = await db
      .update(hdMachine)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(hdMachine.id, id))
      .returning();

    if (deleted.length === 0) {
      return notFoundResponse("Machine not found");
    }

    return successResponse({ message: "Machine deleted successfully" });
  } catch (error) {
    console.error("Error deleting machine:", error);
    return serverErrorResponse("Failed to delete machine");
  }
}
