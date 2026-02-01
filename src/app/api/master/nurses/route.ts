import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { nurse, user } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createNurseSchema } from "@/lib/validations/staff";
import { desc, ilike, or, sql, eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.NURSE_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let baseQuery = db
      .select({
        id: nurse.id,
        userId: nurse.userId,
        nip: nurse.nip,
        sip: nurse.sip,
        certification: nurse.certification,
        certificationExpiry: nurse.certificationExpiry,
        isActive: nurse.isActive,
        createdAt: nurse.createdAt,
        name: user.name,
        email: user.email,
      })
      .from(nurse)
      .innerJoin(user, eq(nurse.userId, user.id))
      .where(eq(nurse.isActive, true));

    if (search) {
      baseQuery = db
        .select({
          id: nurse.id,
          userId: nurse.userId,
          nip: nurse.nip,
          sip: nurse.sip,
          certification: nurse.certification,
          certificationExpiry: nurse.certificationExpiry,
          isActive: nurse.isActive,
          createdAt: nurse.createdAt,
          name: user.name,
          email: user.email,
        })
        .from(nurse)
        .innerJoin(user, eq(nurse.userId, user.id))
        .where(
          or(
            ilike(user.name, `%${search}%`),
            ilike(user.email, `%${search}%`),
            ilike(nurse.nip, `%${search}%`),
            ilike(nurse.sip, `%${search}%`)
          )
        ) as typeof baseQuery;
    }

    const [nurses, countResult] = await Promise.all([
      baseQuery.orderBy(desc(nurse.createdAt)).limit(limit).offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(nurse)
        .where(eq(nurse.isActive, true))
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(nurses, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching nurses:", error);
    return serverErrorResponse("Failed to fetch nurses");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.NURSE_CREATE);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createNurseSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten());
    }

    const data = validation.data;

    // Create user first
    const userId = createId();
    const newUser = await db
      .insert(user)
      .values({
        id: userId,
        name: data.name,
        email: data.email,
        emailVerified: false,
        role: "nurse",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create nurse record
    const newNurse = await db
      .insert(nurse)
      .values({
        userId: newUser[0].id,
        nip: data.nip,
        sip: data.sip,
        certification: data.certification,
        certificationExpiry: data.certificationExpiry
          ? new Date(data.certificationExpiry)
          : null,
      })
      .returning();

    return successResponse(
      {
        ...newNurse[0],
        name: newUser[0].name,
        email: newUser[0].email,
      },
      undefined,
      201
    );
  } catch (error) {
    console.error("Error creating nurse:", error);
    return serverErrorResponse("Failed to create nurse");
  }
}
