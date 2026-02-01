import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ruangInformasi } from "@/db/schema";
import { successResponse, serverErrorResponse } from "@/lib/api/response";
import { desc, ilike, or, eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return successResponse([]);
    }

    const suggestions = await db
      .select({
        id: ruangInformasi.id,
        title: ruangInformasi.title,
        slug: ruangInformasi.slug,
        category: ruangInformasi.category,
        excerpt: ruangInformasi.excerpt,
        imageUrl: ruangInformasi.imageUrl,
      })
      .from(ruangInformasi)
      .where(
        and(
          eq(ruangInformasi.isActive, true),
          eq(ruangInformasi.isPublished, true),
          or(
            ilike(ruangInformasi.title, `%${query}%`),
            ilike(ruangInformasi.excerpt, `%${query}%`)
          )
        )
      )
      .orderBy(desc(ruangInformasi.viewCount))
      .limit(5);

    return successResponse(suggestions);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return serverErrorResponse("Failed to fetch suggestions");
  }
}
