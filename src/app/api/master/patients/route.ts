import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { patient } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createPatientSchema } from "@/lib/validations/patient";
import { desc, ilike, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.PATIENT_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let query = db.select().from(patient);

    if (search) {
      query = query.where(
        or(
          ilike(patient.name, `%${search}%`),
          ilike(patient.medicalRecordNumber, `%${search}%`),
          ilike(patient.nik, `%${search}%`)
        )
      ) as typeof query;
    }

    const [patients, countResult] = await Promise.all([
      query.orderBy(desc(patient.createdAt)).limit(limit).offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(patient)
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(patients, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return serverErrorResponse("Failed to fetch patients");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.PATIENT_CREATE);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createPatientSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const newPatient = await db
      .insert(patient)
      .values({
        medicalRecordNumber: data.medicalRecordNumber,
        name: data.name,
        nik: data.nik,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        bloodType: data.bloodType,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelation: data.emergencyContactRelation,
        primaryDiagnosis: data.primaryDiagnosis,
        hdStartDate: data.hdStartDate ? new Date(data.hdStartDate) : null,
        vascularAccessType: data.vascularAccessType,
        vascularAccessSite: data.vascularAccessSite,
        dryWeight: data.dryWeight,
        insuranceType: data.insuranceType,
        insuranceNumber: data.insuranceNumber,
        primaryDoctorId: data.primaryDoctorId,
      })
      .returning();

    return successResponse(newPatient[0], undefined, 201);
  } catch (error) {
    console.error("Error creating patient:", error);
    return serverErrorResponse("Failed to create patient");
  }
}
