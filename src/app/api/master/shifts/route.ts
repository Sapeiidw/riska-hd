import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { shift } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createShiftSchema } from "@/lib/validations/facility";
import { desc, sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.SHIFT_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const [shifts, countResult] = await Promise.all([
      db
        .select()
        .from(shift)
        .where(eq(shift.isActive, true))
        .orderBy(desc(shift.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(shift)
        .where(eq(shift.isActive, true))
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(shifts, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return serverErrorResponse("Failed to fetch shifts");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.SHIFT_CREATE);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createShiftSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const newShift = await db
      .insert(shift)
      .values({
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        maxPatients: data.maxPatients,
      })
      .returning();

    return successResponse(newShift[0], undefined, 201);
  } catch (error) {
    console.error("Error creating shift:", error);
    return serverErrorResponse("Failed to create shift");
  }
}
