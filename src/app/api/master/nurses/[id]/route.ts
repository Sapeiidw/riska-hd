import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { nurse, user } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateNurseSchema } from "@/lib/validations/staff";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.NURSE_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const result = await db
      .select({
        id: nurse.id,
        userId: nurse.userId,
        nip: nurse.nip,
        sip: nurse.sip,
        certification: nurse.certification,
        certificationExpiry: nurse.certificationExpiry,
        isActive: nurse.isActive,
        createdAt: nurse.createdAt,
        name: user.name,
        email: user.email,
      })
      .from(nurse)
      .innerJoin(user, eq(nurse.userId, user.id))
      .where(eq(nurse.id, id))
      .limit(1);

    if (result.length === 0) {
      return notFoundResponse("Nurse not found");
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching nurse:", error);
    return serverErrorResponse("Failed to fetch nurse");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.NURSE_UPDATE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateNurseSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    // Get existing nurse
    const existingNurse = await db
      .select()
      .from(nurse)
      .where(eq(nurse.id, id))
      .limit(1);

    if (existingNurse.length === 0) {
      return notFoundResponse("Nurse not found");
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
        .where(eq(user.id, existingNurse[0].userId));
    }

    // Update nurse
    const updatedNurse = await db
      .update(nurse)
      .set({
        nip: data.nip !== undefined ? data.nip : existingNurse[0].nip,
        sip: data.sip !== undefined ? data.sip : existingNurse[0].sip,
        certification:
          data.certification !== undefined
            ? data.certification
            : existingNurse[0].certification,
        certificationExpiry: data.certificationExpiry
          ? new Date(data.certificationExpiry)
          : existingNurse[0].certificationExpiry,
        updatedAt: new Date(),
      })
      .where(eq(nurse.id, id))
      .returning();

    // Get updated user info
    const updatedUser = await db
      .select()
      .from(user)
      .where(eq(user.id, existingNurse[0].userId))
      .limit(1);

    return successResponse({
      ...updatedNurse[0],
      name: updatedUser[0].name,
      email: updatedUser[0].email,
    });
  } catch (error) {
    console.error("Error updating nurse:", error);
    return serverErrorResponse("Failed to update nurse");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.NURSE_DELETE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const existingNurse = await db
      .select()
      .from(nurse)
      .where(eq(nurse.id, id))
      .limit(1);

    if (existingNurse.length === 0) {
      return notFoundResponse("Nurse not found");
    }

    // Soft delete - set isActive to false
    await db
      .update(nurse)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(nurse.id, id));

    return successResponse({ message: "Nurse deleted successfully" });
  } catch (error) {
    console.error("Error deleting nurse:", error);
    return serverErrorResponse("Failed to delete nurse");
  }
}
