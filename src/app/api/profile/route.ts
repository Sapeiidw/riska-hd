import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/db/schema";
import { requireAuth } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;

    const result = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        image: user.image,
        nik: user.nik,
        isActivated: user.isActivated,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return serverErrorResponse("Gagal memuat profil");
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;
    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const updatedUser = await db
      .update(user)
      .set({
        name: data.name,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        image: user.image,
        nik: user.nik,
        isActivated: user.isActivated,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

    return successResponse(updatedUser[0]);
  } catch (error) {
    console.error("Error updating profile:", error);
    return serverErrorResponse("Gagal mengupdate profil");
  }
}
