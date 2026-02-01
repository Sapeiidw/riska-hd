import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/db/schema";
import { requireAuth } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  errorResponse,
} from "@/lib/api/response";
import { eq } from "drizzle-orm";
import { z } from "zod";

const activateSchema = z.object({
  nik: z
    .string()
    .length(16, "NIK harus 16 digit")
    .regex(/^\d+$/, "NIK harus berupa angka"),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;
    const body = await request.json();
    const validation = activateSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const { nik } = validation.data;

    // Check if NIK already used by another user
    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.nik, nik))
      .limit(1);

    if (existingUser[0] && existingUser[0].id !== session.user.id) {
      return errorResponse("NIK_EXISTS", "NIK sudah digunakan oleh user lain", 400);
    }

    // Update user with NIK and activate
    const updatedUser = await db
      .update(user)
      .set({
        nik,
        isActivated: true,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        nik: user.nik,
        isActivated: user.isActivated,
      });

    return successResponse({
      message: "Akun berhasil diaktivasi",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Error activating account:", error);
    return serverErrorResponse("Gagal mengaktivasi akun");
  }
}
