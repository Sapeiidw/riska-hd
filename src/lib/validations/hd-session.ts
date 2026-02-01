import { z } from "zod";

// Pre-HD Assessment Schema
const preHdAssessmentSchema = z.object({
  preWeight: z.number().min(10000).max(200000).optional().nullable(), // 10kg - 200kg dalam gram
  preSystolic: z.number().min(60).max(250).optional().nullable(),
  preDiastolic: z.number().min(30).max(150).optional().nullable(),
  prePulse: z.number().min(30).max(200).optional().nullable(),
  preTemperature: z.number().min(340).max(420).optional().nullable(), // 34.0 - 42.0 (x10)
  preComplaints: z.string().optional().nullable(),
});

// HD Parameters Schema
const hdParametersSchema = z.object({
  ufGoal: z.number().min(0).max(6000).optional().nullable(), // max 6L dalam ml
  bloodFlow: z.number().min(100).max(500).optional().nullable(), // QB: 100-500 ml/min
  dialysateFlow: z.number().min(300).max(800).optional().nullable(), // QD: 300-800 ml/min
  tmp: z.number().min(0).max(400).optional().nullable(),
  duration: z.number().min(60).max(480).optional().nullable(), // 1-8 jam dalam menit
  vascularAccess: z
    .enum(["avf", "avg", "cvc", "permcath"])
    .optional()
    .nullable(),
  vascularAccessSite: z.string().optional().nullable(),
  dialyzerType: z.string().optional().nullable(),
  dialyzerReuse: z.number().min(0).max(20).optional().nullable(),
  anticoagulant: z.string().optional().nullable(),
  anticoagulantDose: z.string().optional().nullable(),
  dialysateType: z.string().optional().nullable(),
  dialysateTemperature: z.number().min(34).max(40).optional().nullable(),
  machineId: z.string().optional().nullable(),
  hdProtocolId: z.string().optional().nullable(),
});

// Post-HD Assessment Schema
const postHdAssessmentSchema = z.object({
  postWeight: z.number().min(10000).max(200000).optional().nullable(),
  postSystolic: z.number().min(60).max(250).optional().nullable(),
  postDiastolic: z.number().min(30).max(150).optional().nullable(),
  postPulse: z.number().min(30).max(200).optional().nullable(),
  actualUf: z.number().min(0).max(8000).optional().nullable(),
  postNotes: z.string().optional().nullable(),
});

// Create HD Session Schema (untuk memulai sesi)
export const createHdSessionSchema = z.object({
  patientScheduleId: z.string().min(1, "Jadwal pasien wajib dipilih"),
  patientId: z.string().min(1, "Pasien wajib dipilih"),
  sessionDate: z.string().min(1, "Tanggal sesi wajib diisi"),
  startTime: z.string().optional().nullable(),
  ...preHdAssessmentSchema.shape,
  ...hdParametersSchema.shape,
});

// Update HD Session Schema (untuk update data sesi yang sedang berjalan)
export const updateHdSessionSchema = z.object({
  ...preHdAssessmentSchema.shape,
  ...hdParametersSchema.shape,
  ...postHdAssessmentSchema.shape,
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  status: z.enum(["in_progress", "completed", "terminated"]).optional(),
});

// Complete Session Schema (untuk menyelesaikan sesi)
export const completeHdSessionSchema = z.object({
  ...postHdAssessmentSchema.shape,
  endTime: z.string().min(1, "Waktu selesai wajib diisi"),
});

// Session Complication Schema
export const createSessionComplicationSchema = z.object({
  hdSessionId: z.string().min(1, "Sesi HD wajib dipilih"),
  complicationId: z.string().min(1, "Komplikasi wajib dipilih"),
  occurredAt: z.string().min(1, "Waktu kejadian wajib diisi"),
  action: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Session Medication Schema
export const createSessionMedicationSchema = z.object({
  hdSessionId: z.string().min(1, "Sesi HD wajib dipilih"),
  medicationId: z.string().min(1, "Obat wajib dipilih"),
  dosage: z.string().min(1, "Dosis wajib diisi"),
  route: z.string().min(1, "Rute pemberian wajib diisi"),
  administeredAt: z.string().min(1, "Waktu pemberian wajib diisi"),
  notes: z.string().optional().nullable(),
});

export type CreateHdSessionInput = z.infer<typeof createHdSessionSchema>;
export type UpdateHdSessionInput = z.infer<typeof updateHdSessionSchema>;
export type CompleteHdSessionInput = z.infer<typeof completeHdSessionSchema>;
export type CreateSessionComplicationInput = z.infer<
  typeof createSessionComplicationSchema
>;
export type CreateSessionMedicationInput = z.infer<
  typeof createSessionMedicationSchema
>;
