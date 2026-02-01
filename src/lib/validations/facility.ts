import { z } from "zod";

// Room validation
export const createRoomSchema = z.object({
  name: z.string().min(1, "Nama ruangan wajib diisi"),
  code: z.string().min(1, "Kode ruangan wajib diisi"),
  floor: z.string().optional().nullable(),
  capacity: z.number().min(1, "Kapasitas minimal 1"),
  description: z.string().optional().nullable(),
});

export const updateRoomSchema = createRoomSchema.partial();

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;

// HD Machine validation
export const createHdMachineSchema = z.object({
  serialNumber: z.string().min(1, "Nomor seri wajib diisi"),
  brand: z.string().min(1, "Merek wajib diisi"),
  model: z.string().min(1, "Model wajib diisi"),
  roomId: z.string().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  lastMaintenanceDate: z.string().optional().nullable(),
  nextMaintenanceDate: z.string().optional().nullable(),
  status: z.enum(["available", "in_use", "maintenance", "out_of_service"]).default("available"),
  notes: z.string().optional().nullable(),
});

export const updateHdMachineSchema = createHdMachineSchema.partial();

export type CreateHdMachineInput = z.infer<typeof createHdMachineSchema>;
export type UpdateHdMachineInput = z.infer<typeof updateHdMachineSchema>;

// Shift validation
export const createShiftSchema = z.object({
  name: z.string().min(1, "Nama shift wajib diisi"),
  startTime: z.string().min(1, "Jam mulai wajib diisi"),
  endTime: z.string().min(1, "Jam selesai wajib diisi"),
  maxPatients: z.number().optional().nullable(),
});

export const updateShiftSchema = createShiftSchema.partial();

export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
