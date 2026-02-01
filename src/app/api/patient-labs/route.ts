import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { patientLabResult, patient, user } from "@/db/schema";
import { requirePermission, getSession } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  forbiddenResponse,
} from "@/lib/api/response";
import { PERMISSIONS, hasRole, ROLE_NAMES } from "@/lib/permissions";
import { createPatientLabResultSchema } from "@/lib/validations/patient-lab";
import { desc, eq, sql, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.PATIENT_LAB_READ
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const patientIdParam = searchParams.get("patientId");
    const offset = (page - 1) * limit;

    const conditions = [];

    // Jika user adalah pasien, hanya tampilkan data miliknya
    if (hasRole(session.user as { role?: string | null }, ROLE_NAMES.PASIEN)) {
      const patientRecord = await db
        .select({ id: patient.id })
        .from(patient)
        .where(eq(patient.userId, session.user.id))
        .limit(1);

      if (!patientRecord[0]) {
        return forbiddenResponse("Data pasien tidak ditemukan");
      }
      conditions.push(eq(patientLabResult.patientId, patientRecord[0].id));
    } else if (patientIdParam) {
      conditions.push(eq(patientLabResult.patientId, patientIdParam));
    }

    if (startDate) {
      conditions.push(gte(patientLabResult.testDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(patientLabResult.testDate, new Date(endDate)));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [labs, countResult] = await Promise.all([
      db
        .select({
          id: patientLabResult.id,
          patientId: patientLabResult.patientId,
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
          additionalLabs: patientLabResult.additionalLabs,
          labSource: patientLabResult.labSource,
          notes: patientLabResult.notes,
          createdAt: patientLabResult.createdAt,
          patientName: patient.name,
          patientMrn: patient.medicalRecordNumber,
          enteredByName: user.name,
        })
        .from(patientLabResult)
        .innerJoin(patient, eq(patientLabResult.patientId, patient.id))
        .leftJoin(user, eq(patientLabResult.enteredById, user.id))
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
    return serverErrorResponse("Gagal memuat data lab");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.PATIENT_LAB_CREATE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;

    const body = await request.json();
    const validation = createPatientLabResultSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    // Cek pasien ada
    const patientRecord = await db
      .select({ id: patient.id })
      .from(patient)
      .where(eq(patient.id, data.patientId))
      .limit(1);

    if (!patientRecord[0]) {
      return serverErrorResponse("Pasien tidak ditemukan");
    }

    const newLab = await db
      .insert(patientLabResult)
      .values({
        patientId: data.patientId,
        testDate: new Date(data.testDate),
        reportDate: data.reportDate ? new Date(data.reportDate) : null,
        hemoglobin: data.hemoglobin,
        ureum: data.ureum,
        creatinine: data.creatinine,
        potassium: data.potassium,
        sodium: data.sodium,
        calcium: data.calcium,
        phosphorus: data.phosphorus,
        albumin: data.albumin,
        uricAcid: data.uricAcid,
        ktv: data.ktv,
        urr: data.urr,
        additionalLabs: data.additionalLabs,
        labSource: data.labSource,
        notes: data.notes,
        enteredById: session.user.id,
      })
      .returning();

    return successResponse(newLab[0], undefined, 201);
  } catch (error) {
    console.error("Error creating patient lab:", error);
    return serverErrorResponse("Gagal menyimpan data lab");
  }
}
