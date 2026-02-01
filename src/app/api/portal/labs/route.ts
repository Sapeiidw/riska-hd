import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { patientLabResult, patient } from "@/db/schema";
import { requireAuth } from "@/lib/api/auth";
import {
  successResponse,
  serverErrorResponse,
  forbiddenResponse,
} from "@/lib/api/response";
import { hasRole, ROLE_NAMES } from "@/lib/permissions";
import { eq, sql, desc, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;

    // Pastikan user adalah pasien
    if (!hasRole(session.user as { role?: string | null }, ROLE_NAMES.PASIEN)) {
      return forbiddenResponse("Akses hanya untuk pasien");
    }

    // Get patient ID
    const patientRecord = await db
      .select({ id: patient.id })
      .from(patient)
      .where(eq(patient.userId, session.user.id))
      .limit(1);

    if (!patientRecord[0]) {
      return forbiddenResponse("Data pasien tidak ditemukan");
    }

    const patientId = patientRecord[0].id;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const offset = (page - 1) * limit;

    const conditions = [eq(patientLabResult.patientId, patientId)];

    if (startDate) {
      conditions.push(gte(patientLabResult.testDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(patientLabResult.testDate, new Date(endDate)));
    }

    const whereClause = and(...conditions);

    const [labs, countResult] = await Promise.all([
      db
        .select({
          id: patientLabResult.id,
          testDate: patientLabResult.testDate,
          reportDate: patientLabResult.reportDate,
          hemoglobin: patientLabResult.hemoglobin,
          ureum: patientLabResult.ureum,
          creatinine: patientLabResult.creatinine,
          potassium: patientLabResult.potassium,
          sodium: patientLabResult.sodium,
          calcium: patientLabResult.calcium,
          phosphorus: patientLabResult.phosphorus,
          albumin: patientLabResult.albumin,
          uricAcid: patientLabResult.uricAcid,
          ktv: patientLabResult.ktv,
          urr: patientLabResult.urr,
          labSource: patientLabResult.labSource,
          notes: patientLabResult.notes,
        })
        .from(patientLabResult)
        .where(whereClause)
        .orderBy(desc(patientLabResult.testDate))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(patientLabResult)
        .where(whereClause)
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(labs, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching patient labs:", error);
    return serverErrorResponse("Gagal memuat hasil lab");
  }
}
