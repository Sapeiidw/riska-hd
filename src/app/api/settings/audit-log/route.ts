import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auditLog, user } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import { successResponse, serverErrorResponse } from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { desc, eq, ilike, or, sql, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.AUDIT_LOG_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const resource = searchParams.get("resource") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(auditLog.action, `%${search}%`),
          ilike(auditLog.resource, `%${search}%`),
          ilike(auditLog.resourceId, `%${search}%`)
        )
      );
    }

    if (action) {
      conditions.push(eq(auditLog.action, action));
    }

    if (resource) {
      conditions.push(eq(auditLog.resource, resource));
    }

    if (startDate) {
      conditions.push(gte(auditLog.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(auditLog.createdAt, new Date(endDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [logs, countResult] = await Promise.all([
      db
        .select({
          id: auditLog.id,
          userId: auditLog.userId,
          userName: user.name,
          userEmail: user.email,
          action: auditLog.action,
          resource: auditLog.resource,
          resourceId: auditLog.resourceId,
          oldValues: auditLog.oldValues,
          newValues: auditLog.newValues,
          ipAddress: auditLog.ipAddress,
          userAgent: auditLog.userAgent,
          createdAt: auditLog.createdAt,
        })
        .from(auditLog)
        .leftJoin(user, eq(auditLog.userId, user.id))
        .where(whereClause)
        .orderBy(desc(auditLog.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(auditLog)
        .where(whereClause)
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(logs, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return serverErrorResponse("Failed to fetch audit logs");
  }
}
