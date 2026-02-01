import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { patient, doctor, user, hdSession, patientSchedule } from "@/db/schema";
import { requireAuth } from "@/lib/api/auth";
import {
  successResponse,
  serverErrorResponse,
  forbiddenResponse,
} from "@/lib/api/response";
import { hasRole, ROLE_NAMES } from "@/lib/permissions";
import { eq, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { session } = authResult;

    // Pastikan user adalah pasien
    if (!hasRole(session.user as { role?: string | null }, ROLE_NAMES.PASIEN)) {
      return forbiddenResponse("Akses hanya untuk pasien");
    }

    // Get patient profile
    const doctorUser = db
      .select({ id: doctor.id, name: user.name, specialization: doctor.specialization })
      .from(doctor)
      .innerJoin(user, eq(doctor.userId, user.id))
      .as("doctorUser");

    const patientData = await db
      .select({
        id: patient.id,
        medicalRecordNumber: patient.medicalRecordNumber,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodType: patient.bloodType,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        city: patient.city,
        province: patient.province,
        primaryDiagnosis: patient.primaryDiagnosis,
        hdStartDate: patient.hdStartDate,
        vascularAccessType: patient.vascularAccessType,
        vascularAccessSite: patient.vascularAccessSite,
        dryWeight: patient.dryWeight,
        insuranceType: patient.insuranceType,
        insuranceNumber: patient.insuranceNumber,
        primaryDoctorId: patient.primaryDoctorId,
        doctorName: doctorUser.name,
        doctorSpecialization: doctorUser.specialization,
      })
      .from(patient)
      .leftJoin(doctorUser, eq(patient.primaryDoctorId, doctorUser.id))
      .where(eq(patient.userId, session.user.id))
      .limit(1);

    if (!patientData[0]) {
      return forbiddenResponse("Data pasien tidak ditemukan");
    }

    // Get summary stats
    const [totalSessions, lastSession, upcomingSchedules] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(hdSession)
        .where(eq(hdSession.patientId, patientData[0].id))
        .then((r) => Number(r[0]?.count || 0)),
      db
        .select({
          sessionDate: hdSession.sessionDate,
          status: hdSession.status,
        })
        .from(hdSession)
        .where(eq(hdSession.patientId, patientData[0].id))
        .orderBy(desc(hdSession.sessionDate))
        .limit(1)
        .then((r) => r[0] || null),
      db
        .select({ count: sql<number>`count(*)` })
        .from(patientSchedule)
        .where(eq(patientSchedule.patientId, patientData[0].id))
        .then((r) => Number(r[0]?.count || 0)),
    ]);

    return successResponse({
      profile: patientData[0],
      stats: {
        totalSessions,
        lastSessionDate: lastSession?.sessionDate || null,
        upcomingSchedules,
      },
    });
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return serverErrorResponse("Gagal memuat profil pasien");
  }
}
