import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ruangInformasi, user } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createRuangInformasiSchema } from "@/lib/validations/ruang-informasi";
import { desc, ilike, or, sql, eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.RUANG_INFORMASI_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const publishedOnly = searchParams.get("publishedOnly") === "true";
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(ruangInformasi.isActive, true)];

    if (publishedOnly) {
      conditions.push(eq(ruangInformasi.isPublished, true));
    }

    if (category) {
      conditions.push(eq(ruangInformasi.category, category));
    }

    let whereClause = and(...conditions);

    if (search) {
      whereClause = and(
        ...conditions,
        or(
          ilike(ruangInformasi.title, `%${search}%`),
          ilike(ruangInformasi.content, `%${search}%`),
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
        .where(whereClause)
        .orderBy(desc(ruangInformasi.createdAt))
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
    console.error("Error fetching ruang informasi:", error);
    return serverErrorResponse("Failed to fetch ruang informasi");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.RUANG_INFORMASI_CREATE);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createRuangInformasiSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    // Get current user for author (authResult.session is already available from requirePermission)
    const authorId = authResult.session?.user?.id || null;

    const newItem = await db
      .insert(ruangInformasi)
      .values({
        title: data.title,
        slug: data.slug,
        category: data.category,
        content: data.content,
        excerpt: data.excerpt || null,
        imageUrl: data.imageUrl || null,
        videoUrl: data.videoUrl || null,
        externalLinks: data.externalLinks ? JSON.stringify(data.externalLinks) : null,
        authorId,
        isPublished: data.isPublished ?? false,
        publishedAt: data.isPublished ? new Date() : null,
      })
      .returning();

    return successResponse(newItem[0], undefined, 201);
  } catch (error) {
    console.error("Error creating ruang informasi:", error);
    return serverErrorResponse("Failed to create ruang informasi");
  }
}
