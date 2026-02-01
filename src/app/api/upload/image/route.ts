import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return validationErrorResponse({ image: "File gambar wajib diupload" });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return validationErrorResponse({
        image: "Format file harus JPG, PNG, WebP, atau GIF",
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return validationErrorResponse({
        image: "Ukuran file maksimal 5MB",
      });
    }

    // Convert to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return successResponse({
      url: dataUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return serverErrorResponse("Gagal mengupload gambar");
  }
}
