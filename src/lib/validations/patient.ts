import { z } from "zod";

export const createPatientSchema = z.object({
  medicalRecordNumber: z.string().min(1, "Nomor rekam medis wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  nik: z.string().length(16, "NIK harus 16 digit").optional().nullable(),
  dateOfBirth: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["male", "female"], {
    message: "Jenis kelamin wajib dipilih",
  }),
  bloodType: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email tidak valid").optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  emergencyContactRelation: z.string().optional().nullable(),
  primaryDiagnosis: z.string().optional().nullable(),
  hdStartDate: z.string().optional().nullable(),
  vascularAccessType: z.string().optional().nullable(),
  vascularAccessSite: z.string().optional().nullable(),
  dryWeight: z.number().optional().nullable(),
  insuranceType: z.string().optional().nullable(),
  insuranceNumber: z.string().optional().nullable(),
  primaryDoctorId: z.string().optional().nullable(),
});

export const updatePatientSchema = createPatientSchema.partial();

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
