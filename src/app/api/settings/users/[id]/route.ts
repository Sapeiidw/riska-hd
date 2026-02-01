import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").optional(),
  email: z.string().email("Email tidak valid").optional(),
  role: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.USER_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const result = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (result.length === 0) {
      return notFoundResponse("User not found");
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return serverErrorResponse("Failed to fetch user");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.USER_UPDATE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return notFoundResponse("User not found");
    }

    const updatedUser = await db
      .update(user)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role }),
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))
      .returning();

    return successResponse(updatedUser[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return serverErrorResponse("Failed to update user");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.USER_DELETE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return notFoundResponse("User not found");
    }

    await db.delete(user).where(eq(user.id, id));

    return successResponse({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return serverErrorResponse("Failed to delete user");
  }
}
