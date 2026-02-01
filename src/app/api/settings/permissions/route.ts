import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { permission } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import { successResponse, serverErrorResponse } from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.ROLE_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const permissions = await db
      .select({
        id: permission.id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      })
      .from(permission)
      .orderBy(permission.resource, permission.action);

    // Group permissions by resource
    const grouped = permissions.reduce(
      (acc, perm) => {
        if (!acc[perm.resource]) {
          acc[perm.resource] = [];
        }
        acc[perm.resource].push(perm);
        return acc;
      },
      {} as Record<string, typeof permissions>
    );

    return successResponse({
      permissions,
      grouped,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return serverErrorResponse("Failed to fetch permissions");
  }
}
