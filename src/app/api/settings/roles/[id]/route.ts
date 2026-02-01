import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { role, rolePermission, permission } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const updateRoleSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi").optional(),
  displayName: z.string().min(1, "Display name wajib diisi").optional(),
  description: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.ROLE_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const result = await db
      .select({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })
      .from(role)
      .where(eq(role.id, id))
      .limit(1);

    if (result.length === 0) {
      return notFoundResponse("Role not found");
    }

    // Get permissions for this role
    const permissions = await db
      .select({
        id: permission.id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      })
      .from(rolePermission)
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
      .where(eq(rolePermission.roleId, id));

    return successResponse({
      ...result[0],
      permissions,
    });
  } catch (error) {
    console.error("Error fetching role:", error);
    return serverErrorResponse("Failed to fetch role");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.ROLE_UPDATE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateRoleSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    const existingRole = await db
      .select()
      .from(role)
      .where(eq(role.id, id))
      .limit(1);

    if (existingRole.length === 0) {
      return notFoundResponse("Role not found");
    }

    // Update role
    const updatedRole = await db
      .update(role)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.description !== undefined && { description: data.description }),
        updatedAt: new Date(),
      })
      .where(eq(role.id, id))
      .returning();

    // Update permissions if provided
    if (data.permissions !== undefined) {
      // Remove existing permissions
      await db.delete(rolePermission).where(eq(rolePermission.roleId, id));

      // Add new permissions
      if (data.permissions.length > 0) {
        const permissionRecords = await db
          .select()
          .from(permission)
          .where(sql`${permission.name} IN ${data.permissions}`);

        if (permissionRecords.length > 0) {
          await db.insert(rolePermission).values(
            permissionRecords.map((p) => ({
              roleId: id,
              permissionId: p.id,
            }))
          );
        }
      }
    }

    return successResponse(updatedRole[0]);
  } catch (error) {
    console.error("Error updating role:", error);
    return serverErrorResponse("Failed to update role");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission(request, PERMISSIONS.ROLE_DELETE);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const existingRole = await db
      .select()
      .from(role)
      .where(eq(role.id, id))
      .limit(1);

    if (existingRole.length === 0) {
      return notFoundResponse("Role not found");
    }

    // Delete role (role_permission will be deleted automatically due to cascade)
    await db.delete(role).where(eq(role.id, id));

    return successResponse({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    return serverErrorResponse("Failed to delete role");
  }
}
