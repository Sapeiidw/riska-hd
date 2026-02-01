import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { room } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateRoomSchema } from "@/lib/validations/facility";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.ROOM_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const result = await db.select().from(room).where(eq(room.id, id)).limit(1);

    if (result.length === 0) {
      return notFoundResponse("Room not found");
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching room:", error);
    return serverErrorResponse("Failed to fetch room");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.ROOM_UPDATE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateRoomSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const updated = await db
      .update(room)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.floor !== undefined && { floor: data.floor }),
        ...(data.capacity && { capacity: data.capacity }),
        ...(data.description !== undefined && { description: data.description }),
        updatedAt: new Date(),
      })
      .where(eq(room.id, id))
      .returning();

    if (updated.length === 0) {
      return notFoundResponse("Room not found");
    }

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating room:", error);
    return serverErrorResponse("Failed to update room");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.ROOM_DELETE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const deleted = await db
      .update(room)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(room.id, id))
      .returning();

    if (deleted.length === 0) {
      return notFoundResponse("Room not found");
    }

    return successResponse({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    return serverErrorResponse("Failed to delete room");
  }
}
