import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { diagnosis } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createDiagnosisSchema } from "@/lib/validations/medical";
import { desc, ilike, or, sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.DIAGNOSIS_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let baseQuery = db.select().from(diagnosis).where(eq(diagnosis.isActive, true));

    if (search) {
      baseQuery = db
        .select()
        .from(diagnosis)
        .where(
          or(
            ilike(diagnosis.name, `%${search}%`),
            ilike(diagnosis.icdCode, `%${search}%`)
          )
        ) as typeof baseQuery;
    }

    const [diagnoses, countResult] = await Promise.all([
      baseQuery.orderBy(desc(diagnosis.createdAt)).limit(limit).offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(diagnosis)
        .where(eq(diagnosis.isActive, true))
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(diagnoses, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching diagnoses:", error);
    return serverErrorResponse("Failed to fetch diagnoses");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.DIAGNOSIS_CREATE);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createDiagnosisSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const newDiagnosis = await db
      .insert(diagnosis)
      .values({
        icdCode: data.icdCode,
        name: data.name,
        category: data.category,
        description: data.description,
      })
      .returning();

    return successResponse(newDiagnosis[0], undefined, 201);
  } catch (error) {
    console.error("Error creating diagnosis:", error);
    return serverErrorResponse("Failed to create diagnosis");
  }
}
