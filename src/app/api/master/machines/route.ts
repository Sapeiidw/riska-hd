import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hdMachine, room } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createHdMachineSchema } from "@/lib/validations/facility";
import { desc, ilike, or, sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.HD_MACHINE_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let baseQuery = db
      .select({
        id: hdMachine.id,
        serialNumber: hdMachine.serialNumber,
        brand: hdMachine.brand,
        model: hdMachine.model,
        roomId: hdMachine.roomId,
        roomName: room.name,
        purchaseDate: hdMachine.purchaseDate,
        lastMaintenanceDate: hdMachine.lastMaintenanceDate,
        nextMaintenanceDate: hdMachine.nextMaintenanceDate,
        status: hdMachine.status,
        notes: hdMachine.notes,
        isActive: hdMachine.isActive,
        createdAt: hdMachine.createdAt,
        updatedAt: hdMachine.updatedAt,
      })
      .from(hdMachine)
      .leftJoin(room, eq(hdMachine.roomId, room.id))
      .where(eq(hdMachine.isActive, true));

    if (search) {
      baseQuery = db
        .select({
          id: hdMachine.id,
          serialNumber: hdMachine.serialNumber,
          brand: hdMachine.brand,
          model: hdMachine.model,
          roomId: hdMachine.roomId,
          roomName: room.name,
          purchaseDate: hdMachine.purchaseDate,
          lastMaintenanceDate: hdMachine.lastMaintenanceDate,
          nextMaintenanceDate: hdMachine.nextMaintenanceDate,
          status: hdMachine.status,
          notes: hdMachine.notes,
          isActive: hdMachine.isActive,
          createdAt: hdMachine.createdAt,
          updatedAt: hdMachine.updatedAt,
        })
        .from(hdMachine)
        .leftJoin(room, eq(hdMachine.roomId, room.id))
        .where(
          or(
            ilike(hdMachine.serialNumber, `%${search}%`),
            ilike(hdMachine.brand, `%${search}%`),
            ilike(hdMachine.model, `%${search}%`)
          )
        ) as typeof baseQuery;
    }

    const [machines, countResult] = await Promise.all([
      baseQuery.orderBy(desc(hdMachine.createdAt)).limit(limit).offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(hdMachine)
        .where(eq(hdMachine.isActive, true))
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(machines, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching machines:", error);
    return serverErrorResponse("Failed to fetch machines");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.HD_MACHINE_CREATE);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createHdMachineSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const newMachine = await db
      .insert(hdMachine)
      .values({
        serialNumber: data.serialNumber,
        brand: data.brand,
        model: data.model,
        roomId: data.roomId,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        lastMaintenanceDate: data.lastMaintenanceDate ? new Date(data.lastMaintenanceDate) : null,
        nextMaintenanceDate: data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : null,
        status: data.status,
        notes: data.notes,
      })
      .returning();

    return successResponse(newMachine[0], undefined, 201);
  } catch (error) {
    console.error("Error creating machine:", error);
    return serverErrorResponse("Failed to create machine");
  }
}
