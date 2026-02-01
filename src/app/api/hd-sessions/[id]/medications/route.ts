import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hdSession, hdSessionMedication, medication } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  notFoundResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createSessionMedicationSchema } from "@/lib/validations/hd-session";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.HD_SESSION_READ
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    // Cek sesi ada
    const existingSession = await db
      .select({ id: hdSession.id })
      .from(hdSession)
      .where(eq(hdSession.id, id))
      .limit(1);

    if (!existingSession[0]) {
      return notFoundResponse("Sesi HD tidak ditemukan");
    }

    const medications = await db
      .select({
        id: hdSessionMedication.id,
        medicationId: hdSessionMedication.medicationId,
        dosage: hdSessionMedication.dosage,
        route: hdSessionMedication.route,
        administeredAt: hdSessionMedication.administeredAt,
        notes: hdSessionMedication.notes,
        createdAt: hdSessionMedication.createdAt,
        medicationName: medication.name,
        medicationGenericName: medication.genericName,
        medicationUnit: medication.unit,
        medicationCategory: medication.category,
      })
      .from(hdSessionMedication)
      .innerJoin(medication, eq(hdSessionMedication.medicationId, medication.id))
      .where(eq(hdSessionMedication.hdSessionId, id));

    return successResponse(medications);
  } catch (error) {
    console.error("Error fetching session medications:", error);
    return serverErrorResponse("Gagal memuat data obat");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(
    request,
    PERMISSIONS.HD_SESSION_UPDATE
  );
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    // Cek sesi ada
    const existingSession = await db
      .select({ id: hdSession.id, status: hdSession.status })
      .from(hdSession)
      .where(eq(hdSession.id, id))
      .limit(1);

    if (!existingSession[0]) {
      return notFoundResponse("Sesi HD tidak ditemukan");
    }

    const body = await request.json();
    const validation = createSessionMedicationSchema.safeParse({
      ...body,
      hdSessionId: id,
    });

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const newMedication = await db
      .insert(hdSessionMedication)
      .values({
        hdSessionId: id,
        medicationId: data.medicationId,
        dosage: data.dosage,
        route: data.route,
        administeredAt: new Date(data.administeredAt),
        notes: data.notes,
      })
      .returning();

    // Get full medication data
    const fullMedication = await db
      .select({
        id: hdSessionMedication.id,
        medicationId: hdSessionMedication.medicationId,
        dosage: hdSessionMedication.dosage,
        route: hdSessionMedication.route,
        administeredAt: hdSessionMedication.administeredAt,
        notes: hdSessionMedication.notes,
        createdAt: hdSessionMedication.createdAt,
        medicationName: medication.name,
        medicationGenericName: medication.genericName,
        medicationUnit: medication.unit,
      })
      .from(hdSessionMedication)
      .innerJoin(medication, eq(hdSessionMedication.medicationId, medication.id))
      .where(eq(hdSessionMedication.id, newMedication[0].id))
      .limit(1);

    return successResponse(fullMedication[0], undefined, 201);
  } catch (error) {
    console.error("Error adding session medication:", error);
    return serverErrorResponse("Gagal menambahkan obat");
  }
}
