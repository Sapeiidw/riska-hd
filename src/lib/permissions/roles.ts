// Default role definitions for RISKA HD

import { PERMISSIONS } from "./constants";

export const ROLE_NAMES = {
  ADMIN: "admin",
  DOKTER: "dokter",
  PERAWAT: "perawat",
  PASIEN: "pasien",
  EDUKATOR: "edukator",
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

export interface RoleDefinition {
  name: RoleName;
  displayName: string;
  description: string;
  permissions: string[];
}

// Admin has all permissions
const ADMIN_PERMISSIONS = Object.values(PERMISSIONS);

// Dokter permissions
const DOKTER_PERMISSIONS = [
  PERMISSIONS.PATIENT_READ,
  PERMISSIONS.PATIENT_UPDATE,
  PERMISSIONS.DOCTOR_READ,
  PERMISSIONS.NURSE_READ,
  PERMISSIONS.ROOM_READ,
  PERMISSIONS.HD_MACHINE_READ,
  PERMISSIONS.SHIFT_READ,
  PERMISSIONS.DIAGNOSIS_READ,
  PERMISSIONS.DIAGNOSIS_CREATE,
  PERMISSIONS.MEDICATION_READ,
  PERMISSIONS.MEDICATION_CREATE,
  PERMISSIONS.HD_PROTOCOL_READ,
  PERMISSIONS.HD_PROTOCOL_CREATE,
  PERMISSIONS.HD_PROTOCOL_UPDATE,
  PERMISSIONS.COMPLICATION_READ,
  PERMISSIONS.RUANG_INFORMASI_READ, // Can view educational content
  PERMISSIONS.RUANG_INFORMASI_CREATE, // Can create educational content
];

// Perawat permissions
const PERAWAT_PERMISSIONS = [
  PERMISSIONS.PATIENT_READ,
  PERMISSIONS.PATIENT_UPDATE,
  PERMISSIONS.DOCTOR_READ,
  PERMISSIONS.NURSE_READ,
  PERMISSIONS.ROOM_READ,
  PERMISSIONS.HD_MACHINE_READ,
  PERMISSIONS.HD_MACHINE_UPDATE,
  PERMISSIONS.SHIFT_READ,
  PERMISSIONS.DIAGNOSIS_READ,
  PERMISSIONS.MEDICATION_READ,
  PERMISSIONS.HD_PROTOCOL_READ,
  PERMISSIONS.COMPLICATION_READ,
  PERMISSIONS.RUANG_INFORMASI_READ, // Can view educational content
];

// Pasien permissions (limited view only)
const PASIEN_PERMISSIONS = [
  PERMISSIONS.PATIENT_READ, // Own profile only (enforced in API)
  PERMISSIONS.DOCTOR_READ,
  PERMISSIONS.DIAGNOSIS_READ,
  PERMISSIONS.MEDICATION_READ,
  PERMISSIONS.RUANG_INFORMASI_READ, // Can view educational content
];

// Edukator permissions
const EDUKATOR_PERMISSIONS = [
  PERMISSIONS.PATIENT_READ,
  PERMISSIONS.DOCTOR_READ,
  PERMISSIONS.NURSE_READ,
  PERMISSIONS.DIAGNOSIS_READ,
  PERMISSIONS.MEDICATION_READ,
  // Ruang Informasi - full access for educators
  PERMISSIONS.RUANG_INFORMASI_CREATE,
  PERMISSIONS.RUANG_INFORMASI_READ,
  PERMISSIONS.RUANG_INFORMASI_UPDATE,
  PERMISSIONS.RUANG_INFORMASI_DELETE,
];

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    name: ROLE_NAMES.ADMIN,
    displayName: "Administrator",
    description: "Full system access - manage all data, users, and configurations",
    permissions: ADMIN_PERMISSIONS,
  },
  {
    name: ROLE_NAMES.DOKTER,
    displayName: "Dokter",
    description: "Clinical access - manage patients, orders, and medical records",
    permissions: DOKTER_PERMISSIONS,
  },
  {
    name: ROLE_NAMES.PERAWAT,
    displayName: "Perawat",
    description: "Nursing access - execute HD sessions, record vitals and events",
    permissions: PERAWAT_PERMISSIONS,
  },
  {
    name: ROLE_NAMES.PASIEN,
    displayName: "Pasien",
    description: "Patient portal access - view own records and educational content",
    permissions: PASIEN_PERMISSIONS,
  },
  {
    name: ROLE_NAMES.EDUKATOR,
    displayName: "Edukator",
    description: "Education content management access",
    permissions: EDUKATOR_PERMISSIONS,
  },
];

export function getRoleByName(name: string): RoleDefinition | undefined {
  return DEFAULT_ROLES.find((role) => role.name === name);
}
