import { z } from "zod";

// Diagnosis validation
export const createDiagnosisSchema = z.object({
  icdCode: z.string().optional().nullable(),
  name: z.string().min(1, "Nama diagnosa wajib diisi"),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const updateDiagnosisSchema = createDiagnosisSchema.partial();

export type CreateDiagnosisInput = z.infer<typeof createDiagnosisSchema>;
export type UpdateDiagnosisInput = z.infer<typeof updateDiagnosisSchema>;

// Medication validation
export const createMedicationSchema = z.object({
  name: z.string().min(1, "Nama obat wajib diisi"),
  genericName: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  unit: z.string().min(1, "Satuan wajib diisi"),
  defaultDosage: z.string().optional().nullable(),
  route: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateMedicationSchema = createMedicationSchema.partial();

export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;

// HD Protocol validation
export const createHdProtocolSchema = z.object({
  name: z.string().min(1, "Nama protokol wajib diisi"),
  dialyzerType: z.string().min(1, "Tipe dialyzer wajib diisi"),
  bloodFlowRate: z.number().optional().nullable(),
  dialysateFlowRate: z.number().optional().nullable(),
  duration: z.number().optional().nullable(),
  ufGoal: z.number().optional().nullable(),
  anticoagulant: z.string().optional().nullable(),
  anticoagulantDose: z.string().optional().nullable(),
  dialysateType: z.string().optional().nullable(),
  dialysateTemperature: z.number().optional().nullable(),
  sodiumLevel: z.number().optional().nullable(),
  potassiumLevel: z.number().optional().nullable(),
  calciumLevel: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateHdProtocolSchema = createHdProtocolSchema.partial();

export type CreateHdProtocolInput = z.infer<typeof createHdProtocolSchema>;
export type UpdateHdProtocolInput = z.infer<typeof updateHdProtocolSchema>;

// Complication validation
export const createComplicationSchema = z.object({
  code: z.string().min(1, "Kode komplikasi wajib diisi"),
  name: z.string().min(1, "Nama komplikasi wajib diisi"),
  category: z.enum(["intradialytic", "post_dialytic", "access_related"]),
  severity: z.enum(["mild", "moderate", "severe"]),
  suggestedAction: z.string().optional().nullable(),
});

export const updateComplicationSchema = createComplicationSchema.partial();

export type CreateComplicationInput = z.infer<typeof createComplicationSchema>;
export type UpdateComplicationInput = z.infer<typeof updateComplicationSchema>;
