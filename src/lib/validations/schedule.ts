import { z } from "zod";

// Nurse Schedule validation
export const createNurseScheduleSchema = z.object({
  nurseId: z.string().min(1, "Perawat wajib dipilih"),
  shiftId: z.string().min(1, "Shift wajib dipilih"),
  scheduleDate: z.string().min(1, "Tanggal jadwal wajib diisi"),
  roomId: z.string().optional().nullable(),
  status: z.enum(["scheduled", "present", "absent", "leave"]),
  notes: z.string().optional().nullable(),
});

export const updateNurseScheduleSchema = createNurseScheduleSchema.partial();

export type CreateNurseScheduleInput = z.infer<typeof createNurseScheduleSchema>;
export type UpdateNurseScheduleInput = z.infer<typeof updateNurseScheduleSchema>;

// Patient Schedule validation
export const createPatientScheduleSchema = z.object({
  patientId: z.string().min(1, "Pasien wajib dipilih"),
  shiftId: z.string().min(1, "Shift wajib dipilih"),
  scheduleDate: z.string().min(1, "Tanggal jadwal wajib diisi"),
  roomId: z.string().optional().nullable(),
  machineId: z.string().optional().nullable(),
  nurseId: z.string().optional().nullable(),
  status: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]),
  notes: z.string().optional().nullable(),
});

export const updatePatientScheduleSchema = createPatientScheduleSchema.partial();

export type CreatePatientScheduleInput = z.infer<typeof createPatientScheduleSchema>;
export type UpdatePatientScheduleInput = z.infer<typeof updatePatientScheduleSchema>;

// Bulk schedule creation
export const bulkNurseScheduleSchema = z.object({
  nurseIds: z.array(z.string()).min(1, "Minimal pilih 1 perawat"),
  shiftId: z.string().min(1, "Shift wajib dipilih"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  roomId: z.string().optional().nullable(),
});

export const bulkPatientScheduleSchema = z.object({
  patientIds: z.array(z.string()).min(1, "Minimal pilih 1 pasien"),
  shiftId: z.string().min(1, "Shift wajib dipilih"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  roomId: z.string().optional().nullable(),
  machineId: z.string().optional().nullable(),
});

export type BulkNurseScheduleInput = z.infer<typeof bulkNurseScheduleSchema>;
export type BulkPatientScheduleInput = z.infer<typeof bulkPatientScheduleSchema>;
