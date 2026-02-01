import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hdProtocol } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateHdProtocolSchema } from "@/lib/validations/medical";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.HD_PROTOCOL_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const result = await db.select().from(hdProtocol).where(eq(hdProtocol.id, id)).limit(1);

    if (result.length === 0) {
      return notFoundResponse("Protocol not found");
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching protocol:", error);
    return serverErrorResponse("Failed to fetch protocol");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.HD_PROTOCOL_UPDATE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateHdProtocolSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const updated = await db
      .update(hdProtocol)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.dialyzerType && { dialyzerType: data.dialyzerType }),
        ...(data.bloodFlowRate !== undefined && { bloodFlowRate: data.bloodFlowRate }),
        ...(data.dialysateFlowRate !== undefined && { dialysateFlowRate: data.dialysateFlowRate }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.ufGoal !== undefined && { ufGoal: data.ufGoal }),
        ...(data.anticoagulant !== undefined && { anticoagulant: data.anticoagulant }),
        ...(data.anticoagulantDose !== undefined && { anticoagulantDose: data.anticoagulantDose }),
        ...(data.dialysateType !== undefined && { dialysateType: data.dialysateType }),
        ...(data.dialysateTemperature !== undefined && { dialysateTemperature: data.dialysateTemperature }),
        ...(data.sodiumLevel !== undefined && { sodiumLevel: data.sodiumLevel }),
        ...(data.potassiumLevel !== undefined && { potassiumLevel: data.potassiumLevel }),
        ...(data.calciumLevel !== undefined && { calciumLevel: data.calciumLevel }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updatedAt: new Date(),
      })
      .where(eq(hdProtocol.id, id))
      .returning();

    if (updated.length === 0) {
      return notFoundResponse("Protocol not found");
    }

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating protocol:", error);
    return serverErrorResponse("Failed to update protocol");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.HD_PROTOCOL_DELETE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const deleted = await db
      .update(hdProtocol)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(hdProtocol.id, id))
      .returning();

    if (deleted.length === 0) {
      return notFoundResponse("Protocol not found");
    }

    return successResponse({ message: "Protocol deleted successfully" });
  } catch (error) {
    console.error("Error deleting protocol:", error);
    return serverErrorResponse("Failed to delete protocol");
  }
}
