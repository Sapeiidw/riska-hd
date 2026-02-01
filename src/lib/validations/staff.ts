import { z } from "zod";

// Doctor validation
export const createDoctorSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  nip: z.string().optional().nullable(),
  sip: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  licenseExpiry: z.string().optional().nullable(),
});

export const updateDoctorSchema = createDoctorSchema.partial();

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;

// Nurse validation
export const createNurseSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  nip: z.string().optional().nullable(),
  sip: z.string().optional().nullable(),
  certification: z.string().optional().nullable(),
  certificationExpiry: z.string().optional().nullable(),
});

export const updateNurseSchema = createNurseSchema.partial();

export type CreateNurseInput = z.infer<typeof createNurseSchema>;
export type UpdateNurseInput = z.infer<typeof updateNurseSchema>;
