import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hdProtocol } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createHdProtocolSchema } from "@/lib/validations/medical";
import { desc, ilike, sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.HD_PROTOCOL_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let baseQuery = db.select().from(hdProtocol).where(eq(hdProtocol.isActive, true));

    if (search) {
      baseQuery = db
        .select()
        .from(hdProtocol)
        .where(ilike(hdProtocol.name, `%${search}%`)) as typeof baseQuery;
    }

    const [protocols, countResult] = await Promise.all([
      baseQuery.orderBy(desc(hdProtocol.createdAt)).limit(limit).offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(hdProtocol)
        .where(eq(hdProtocol.isActive, true))
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(protocols, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching protocols:", error);
    return serverErrorResponse("Failed to fetch protocols");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.HD_PROTOCOL_CREATE);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createHdProtocolSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const newProtocol = await db
      .insert(hdProtocol)
      .values({
        name: data.name,
        dialyzerType: data.dialyzerType,
        bloodFlowRate: data.bloodFlowRate,
        dialysateFlowRate: data.dialysateFlowRate,
        duration: data.duration,
        ufGoal: data.ufGoal,
        anticoagulant: data.anticoagulant,
        anticoagulantDose: data.anticoagulantDose,
        dialysateType: data.dialysateType,
        dialysateTemperature: data.dialysateTemperature,
        sodiumLevel: data.sodiumLevel,
        potassiumLevel: data.potassiumLevel,
        calciumLevel: data.calciumLevel,
        notes: data.notes,
      })
      .returning();

    return successResponse(newProtocol[0], undefined, 201);
  } catch (error) {
    console.error("Error creating protocol:", error);
    return serverErrorResponse("Failed to create protocol");
  }
}
