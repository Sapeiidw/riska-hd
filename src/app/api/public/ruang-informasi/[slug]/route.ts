import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ruangInformasi, user } from "@/db/schema";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [item] = await db
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
        authorName: user.name,
        publishedAt: ruangInformasi.publishedAt,
        viewCount: ruangInformasi.viewCount,
        createdAt: ruangInformasi.createdAt,
      })
      .from(ruangInformasi)
      .leftJoin(user, eq(ruangInformasi.authorId, user.id))
      .where(
        and(
          eq(ruangInformasi.slug, slug),
          eq(ruangInformasi.isActive, true),
          eq(ruangInformasi.isPublished, true)
        )
      )
      .limit(1);

    if (!item) {
      return notFoundResponse("Content not found");
    }

    // Increment view count
    await db
      .update(ruangInformasi)
      .set({ viewCount: sql`${ruangInformasi.viewCount} + 1` })
      .where(eq(ruangInformasi.slug, slug));

    return successResponse(item);
  } catch (error) {
    console.error("Error fetching public content:", error);
    return serverErrorResponse("Failed to fetch content");
  }
}
