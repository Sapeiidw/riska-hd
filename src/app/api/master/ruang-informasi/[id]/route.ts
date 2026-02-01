import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ruangInformasi, user } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateRuangInformasiSchema } from "@/lib/validations/ruang-informasi";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.RUANG_INFORMASI_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const result = await db
      .select({
        id: ruangInformasi.id,
        title: ruangInformasi.title,
        slug: ruangInformasi.slug,
        category: ruangInformasi.category,
        content: ruangInformasi.content,
        excerpt: ruangInformasi.excerpt,
        imageUrl: ruangInformasi.imageUrl,
        videoUrl: ruangInformasi.videoUrl,
        externalLinks: ruangInformasi.externalLinks,
        authorId: ruangInformasi.authorId,
        authorName: user.name,
        publishedAt: ruangInformasi.publishedAt,
        isPublished: ruangInformasi.isPublished,
        isActive: ruangInformasi.isActive,
        viewCount: ruangInformasi.viewCount,
        createdAt: ruangInformasi.createdAt,
        updatedAt: ruangInformasi.updatedAt,
      })
      .from(ruangInformasi)
      .leftJoin(user, eq(ruangInformasi.authorId, user.id))
      .where(eq(ruangInformasi.id, id))
      .limit(1);

    if (result.length === 0) {
      return notFoundResponse("Ruang informasi not found");
    }

    // Parse externalLinks from JSON string
    const item = {
      ...result[0],
      externalLinks: result[0].externalLinks
        ? JSON.parse(result[0].externalLinks)
        : null,
    };

    return successResponse(item);
  } catch (error) {
    console.error("Error fetching ruang informasi:", error);
    return serverErrorResponse("Failed to fetch ruang informasi");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.RUANG_INFORMASI_UPDATE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateRuangInformasiSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    // Get current item to check publish status change
    const currentItem = await db
      .select()
      .from(ruangInformasi)
      .where(eq(ruangInformasi.id, id))
      .limit(1);

    if (currentItem.length === 0) {
      return notFoundResponse("Ruang informasi not found");
    }

    // Determine publishedAt
    let publishedAt = currentItem[0].publishedAt;
    if (data.isPublished !== undefined) {
      if (data.isPublished && !currentItem[0].isPublished) {
        // Being published for the first time
        publishedAt = new Date();
      } else if (!data.isPublished) {
        // Being unpublished
        publishedAt = null;
      }
    }

    const updated = await db
      .update(ruangInformasi)
      .set({
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt || null }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl || null }),
        ...(data.externalLinks !== undefined && {
          externalLinks: data.externalLinks ? JSON.stringify(data.externalLinks) : null,
        }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(ruangInformasi.id, id))
      .returning();

    if (updated.length === 0) {
      return notFoundResponse("Ruang informasi not found");
    }

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating ruang informasi:", error);
    return serverErrorResponse("Failed to update ruang informasi");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.RUANG_INFORMASI_DELETE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const deleted = await db
      .update(ruangInformasi)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(ruangInformasi.id, id))
      .returning();

    if (deleted.length === 0) {
      return notFoundResponse("Ruang informasi not found");
    }

    return successResponse({ message: "Ruang informasi deleted successfully" });
  } catch (error) {
    console.error("Error deleting ruang informasi:", error);
    return serverErrorResponse("Failed to delete ruang informasi");
  }
}
