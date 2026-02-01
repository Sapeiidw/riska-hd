import { z } from "zod";

export const createPatientLabResultSchema = z.object({
  patientId: z.string().min(1, "Pasien wajib dipilih"),
  testDate: z.string().min(1, "Tanggal pemeriksaan wajib diisi"),
  reportDate: z.string().optional().nullable(),

  // Lab values (semua optional)
  hemoglobin: z.number().min(30).max(200).optional().nullable(), // 3.0-20.0 g/dL (x10)
  ureum: z.number().min(0).max(500).optional().nullable(), // mg/dL
  creatinine: z.number().min(0).max(300).optional().nullable(), // 0-30.0 mg/dL (x10)
  potassium: z.number().min(20).max(100).optional().nullable(), // 2.0-10.0 mEq/L (x10)
  sodium: z.number().min(100).max(180).optional().nullable(), // mEq/L
  calcium: z.number().min(50).max(150).optional().nullable(), // 5.0-15.0 mg/dL (x10)
  phosphorus: z.number().min(10).max(150).optional().nullable(), // 1.0-15.0 mg/dL (x10)
  albumin: z.number().min(10).max(60).optional().nullable(), // 1.0-6.0 g/dL (x10)
  uricAcid: z.number().min(10).max(200).optional().nullable(), // 1.0-20.0 mg/dL (x10)
  ktv: z.number().min(50).max(300).optional().nullable(), // 0.50-3.00 (x100)
  urr: z.number().min(0).max(1000).optional().nullable(), // 0-100% (x10)

  additionalLabs: z.string().optional().nullable(), // JSON string
  labSource: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updatePatientLabResultSchema =
  createPatientLabResultSchema.partial();

export type CreatePatientLabResultInput = z.infer<
  typeof createPatientLabResultSchema
>;
export type UpdatePatientLabResultInput = z.infer<
  typeof updatePatientLabResultSchema
>;
