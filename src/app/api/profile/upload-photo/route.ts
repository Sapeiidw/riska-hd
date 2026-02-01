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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;
    const formData = await request.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return validationErrorResponse({ photo: "File foto wajib diupload" });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return validationErrorResponse({
        photo: "Format file harus JPG, PNG, atau WebP",
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return validationErrorResponse({
        photo: "Ukuran file maksimal 5MB",
      });
    }

    // Convert to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Update user image
    const updatedUser = await db
      .update(user)
      .set({
        image: dataUrl,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      });

    return successResponse({
      message: "Foto profil berhasil diupload",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return serverErrorResponse("Gagal mengupload foto profil");
  }
}
