import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { medication } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createMedicationSchema } from "@/lib/validations/medical";
import { desc, ilike, or, sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.MEDICATION_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let baseQuery = db.select().from(medication).where(eq(medication.isActive, true));

    if (search) {
      baseQuery = db
        .select()
        .from(medication)
        .where(
          or(
            ilike(medication.name, `%${search}%`),
            ilike(medication.genericName, `%${search}%`)
          )
        ) as typeof baseQuery;
    }

    const [medications, countResult] = await Promise.all([
      baseQuery.orderBy(desc(medication.createdAt)).limit(limit).offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(medication)
        .where(eq(medication.isActive, true))
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(medications, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching medications:", error);
    return serverErrorResponse("Failed to fetch medications");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.MEDICATION_CREATE);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createMedicationSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const newMedication = await db
      .insert(medication)
      .values({
        name: data.name,
        genericName: data.genericName,
        category: data.category,
        unit: data.unit,
        defaultDosage: data.defaultDosage,
        route: data.route,
        notes: data.notes,
      })
      .returning();

    return successResponse(newMedication[0], undefined, 201);
  } catch (error) {
    console.error("Error creating medication:", error);
    return serverErrorResponse("Failed to create medication");
  }
}
