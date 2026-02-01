import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { role, rolePermission, permission } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

const createRoleSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi"),
  displayName: z.string().min(1, "Display name wajib diisi"),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.ROLE_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get roles with permission count
    const rolesData = await db
      .select({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        createdAt: role.createdAt,
        permissionCount: sql<string>`(
          SELECT COUNT(*) FROM role_permission
          WHERE role_permission.role_id = ${role.id}
        )`,
      })
      .from(role)
      .orderBy(desc(role.createdAt))
      .limit(limit)
      .offset(offset);

    // Convert permissionCount to number
    const roles = rolesData.map((r) => ({
      ...r,
      permissionCount: Number(r.permissionCount) || 0,
    }));

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(role)
      .then((r) => r[0]?.count || 0);

    const total = Number(countResult);

    return successResponse(roles, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return serverErrorResponse("Failed to fetch roles");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.ROLE_CREATE);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createRoleSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    // Create role
    const newRole = await db
      .insert(role)
      .values({
        name: data.name,
        displayName: data.displayName,
        description: data.description,
      })
      .returning();

    // Add permissions if provided
    if (data.permissions && data.permissions.length > 0) {
      // Get permission IDs from names
      const permissionRecords = await db
        .select()
        .from(permission)
        .where(sql`${permission.name} IN ${data.permissions}`);

      if (permissionRecords.length > 0) {
        await db.insert(rolePermission).values(
          permissionRecords.map((p) => ({
            roleId: newRole[0].id,
            permissionId: p.id,
          }))
        );
      }
    }

    return successResponse(newRole[0], undefined, 201);
  } catch (error) {
    console.error("Error creating role:", error);
    return serverErrorResponse("Failed to create role");
  }
}
