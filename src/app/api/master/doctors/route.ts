import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { doctor, user } from "@/db/schema";
import { requirePermission } from "@/lib/api/auth";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { PERMISSIONS } from "@/lib/permissions";
import { createDoctorSchema } from "@/lib/validations/staff";
import { desc, ilike, or, sql, eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.DOCTOR_READ);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let baseQuery = db
      .select({
        id: doctor.id,
        userId: doctor.userId,
        nip: doctor.nip,
        sip: doctor.sip,
        specialization: doctor.specialization,
        licenseExpiry: doctor.licenseExpiry,
        isActive: doctor.isActive,
        createdAt: doctor.createdAt,
        name: user.name,
        email: user.email,
      })
      .from(doctor)
      .innerJoin(user, eq(doctor.userId, user.id))
      .where(eq(doctor.isActive, true));

    if (search) {
      baseQuery = db
        .select({
          id: doctor.id,
          userId: doctor.userId,
          nip: doctor.nip,
          sip: doctor.sip,
          specialization: doctor.specialization,
          licenseExpiry: doctor.licenseExpiry,
          isActive: doctor.isActive,
          createdAt: doctor.createdAt,
          name: user.name,
          email: user.email,
        })
        .from(doctor)
        .innerJoin(user, eq(doctor.userId, user.id))
        .where(
          or(
            ilike(user.name, `%${search}%`),
            ilike(user.email, `%${search}%`),
            ilike(doctor.nip, `%${search}%`),
            ilike(doctor.sip, `%${search}%`)
          )
        ) as typeof baseQuery;
    }

    const [doctors, countResult] = await Promise.all([
      baseQuery.orderBy(desc(doctor.createdAt)).limit(limit).offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(doctor)
        .where(eq(doctor.isActive, true))
        .then((r) => r[0]?.count || 0),
    ]);

    const total = Number(countResult);

    return successResponse(doctors, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return serverErrorResponse("Failed to fetch doctors");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.DOCTOR_CREATE);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await request.json();
    const validation = createDoctorSchema.safeParse(body);

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
        role: "doctor",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create doctor record
    const newDoctor = await db
      .insert(doctor)
      .values({
        userId: newUser[0].id,
        nip: data.nip,
        sip: data.sip,
        specialization: data.specialization,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
      })
      .returning();

    return successResponse(
      {
        ...newDoctor[0],
        name: newUser[0].name,
        email: newUser[0].email,
      },
      undefined,
      201
    );
  } catch (error) {
    console.error("Error creating doctor:", error);
    return serverErrorResponse("Failed to create doctor");
  }
}
