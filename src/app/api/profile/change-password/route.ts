import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { account } from "@/db/schema";
import { requireAuth } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  errorResponse,
} from "@/lib/api/response";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hashedPassword;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;
    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const { currentPassword, newPassword } = validation.data;

    // Get current account with password
    const userAccount = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.userId, session.user.id),
          eq(account.providerId, "credential")
        )
      )
      .limit(1);

    if (!userAccount[0] || !userAccount[0].password) {
      return errorResponse(
        "NO_PASSWORD",
        "Akun ini tidak menggunakan password",
        400
      );
    }

    // Verify current password
    const isValidPassword = await verifyPassword(
      currentPassword,
      userAccount[0].password
    );

    if (!isValidPassword) {
      return errorResponse(
        "INVALID_PASSWORD",
        "Password saat ini tidak valid",
        400
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await db
      .update(account)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(account.id, userAccount[0].id));

    return successResponse({
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return serverErrorResponse("Gagal mengubah password");
  }
}
