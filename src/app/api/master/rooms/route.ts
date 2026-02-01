import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { room } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createRoomSchema } from "@/lib/validations/facility";
import { desc, ilike, or, sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.ROOM_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let baseQuery = db.select().from(room).where(eq(room.isActive, true));

    if (search) {
      baseQuery = db
        .select()
        .from(room)
        .where(
          or(
            ilike(room.name, `%${search}%`),
            ilike(room.code, `%${search}%`)
          )
        ) as typeof baseQuery;
    }

    const [rooms, countResult] = await Promise.all([
      baseQuery.orderBy(desc(room.createdAt)).limit(limit).offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(room)
        .where(eq(room.isActive, true))
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(rooms, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return serverErrorResponse("Failed to fetch rooms");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.ROOM_CREATE);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createRoomSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const newRoom = await db
      .insert(room)
      .values({
        name: data.name,
        code: data.code,
        floor: data.floor,
        capacity: data.capacity,
        description: data.description,
      })
      .returning();

    return successResponse(newRoom[0], undefined, 201);
  } catch (error) {
    console.error("Error creating room:", error);
    return serverErrorResponse("Failed to create room");
  }
}
