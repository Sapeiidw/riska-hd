import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ruangInformasi, user } from "@/db/schema";
import { successResponse, serverErrorResponse } from "@/lib/api/response";
import { desc, ilike, or, sql, eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const offset = (page - 1) * limit;

    // Only show published and active content
    const conditions = [
      eq(ruangInformasi.isActive, true),
      eq(ruangInformasi.isPublished, true),
    ];

    if (category) {
      conditions.push(eq(ruangInformasi.category, category));
    }

    let whereClause = and(...conditions);

    if (search) {
      whereClause = and(
        ...conditions,
        or(
          ilike(ruangInformasi.title, `%${search}%`),
          ilike(ruangInformasi.excerpt, `%${search}%`)
        )
      );
    }

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: ruangInformasi.id,
          title: ruangInformasi.title,
          slug: ruangInformasi.slug,
          category: ruangInformasi.category,
          excerpt: ruangInformasi.excerpt,
          imageUrl: ruangInformasi.imageUrl,
          authorName: user.name,
          publishedAt: ruangInformasi.publishedAt,
          viewCount: ruangInformasi.viewCount,
          createdAt: ruangInformasi.createdAt,
        })
        .from(ruangInformasi)
        .leftJoin(user, eq(ruangInformasi.authorId, user.id))
        .where(whereClause)
        .orderBy(desc(ruangInformasi.publishedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(ruangInformasi)
        .where(whereClause)
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(items, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching public ruang informasi:", error);
    return serverErrorResponse("Failed to fetch content");
  }
}
