import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hdSession, hdSessionComplication, complication } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  notFoundResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createSessionComplicationSchema } from "@/lib/validations/hd-session";
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

    const complications = await db
      .select({
        id: hdSessionComplication.id,
        complicationId: hdSessionComplication.complicationId,
        occurredAt: hdSessionComplication.occurredAt,
        action: hdSessionComplication.action,
        notes: hdSessionComplication.notes,
        resolvedAt: hdSessionComplication.resolvedAt,
        createdAt: hdSessionComplication.createdAt,
        complicationName: complication.name,
        complicationCode: complication.code,
        complicationCategory: complication.category,
        complicationSeverity: complication.severity,
        suggestedAction: complication.suggestedAction,
      })
      .from(hdSessionComplication)
      .innerJoin(complication, eq(hdSessionComplication.complicationId, complication.id))
      .where(eq(hdSessionComplication.hdSessionId, id));

    return successResponse(complications);
  } catch (error) {
    console.error("Error fetching session complications:", error);
    return serverErrorResponse("Gagal memuat data komplikasi");
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
    const validation = createSessionComplicationSchema.safeParse({
      ...body,
      hdSessionId: id,
    });

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const newComplication = await db
      .insert(hdSessionComplication)
      .values({
        hdSessionId: id,
        complicationId: data.complicationId,
        occurredAt: new Date(data.occurredAt),
        action: data.action,
        notes: data.notes,
      })
      .returning();

    // Get full complication data
    const fullComplication = await db
      .select({
        id: hdSessionComplication.id,
        complicationId: hdSessionComplication.complicationId,
        occurredAt: hdSessionComplication.occurredAt,
        action: hdSessionComplication.action,
        notes: hdSessionComplication.notes,
        resolvedAt: hdSessionComplication.resolvedAt,
        createdAt: hdSessionComplication.createdAt,
        complicationName: complication.name,
        complicationCode: complication.code,
        complicationCategory: complication.category,
        complicationSeverity: complication.severity,
      })
      .from(hdSessionComplication)
      .innerJoin(complication, eq(hdSessionComplication.complicationId, complication.id))
      .where(eq(hdSessionComplication.id, newComplication[0].id))
      .limit(1);

    return successResponse(fullComplication[0], undefined, 201);
  } catch (error) {
    console.error("Error adding session complication:", error);
    return serverErrorResponse("Gagal menambahkan komplikasi");
  }
}
