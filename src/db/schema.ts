import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ==========================================
// Better Auth tables
// ==========================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  role: text("role").default("user"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ==========================================
// RBAC - Roles & Permissions
// ==========================================

export const role = pgTable("role", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const permission = pgTable("permission", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull().unique(),
  resource: text("resource").notNull(),
  action: text("action").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rolePermission = pgTable(
  "role_permission",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    roleId: text("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permission.id, { onDelete: "cascade" }),
  },
  (table) => [unique().on(table.roleId, table.permissionId)]
);

// ==========================================
// Audit Log
// ==========================================

export const auditLog = pgTable("audit_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").references(() => user.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  oldValues: text("old_values"),
  newValues: text("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// Master Data - Medical References (defined first due to references)
// ==========================================

export const diagnosis = pgTable("diagnosis", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  icdCode: text("icd_code").unique(),
  name: text("name").notNull(),
  category: text("category"),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const medication = pgTable("medication", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  category: text("category"),
  unit: text("unit").notNull(),
  defaultDosage: text("default_dosage"),
  route: text("route"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hdProtocol = pgTable("hd_protocol", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  dialyzerType: text("dialyzer_type").notNull(),
  bloodFlowRate: integer("blood_flow_rate"),
  dialysateFlowRate: integer("dialysate_flow_rate"),
  duration: integer("duration"),
  ufGoal: integer("uf_goal"),
  anticoagulant: text("anticoagulant"),
  anticoagulantDose: text("anticoagulant_dose"),
  dialysateType: text("dialysate_type"),
  dialysateTemperature: integer("dialysate_temperature"),
  sodiumLevel: integer("sodium_level"),
  potassiumLevel: integer("potassium_level"),
  calciumLevel: integer("calcium_level"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const complication = pgTable("complication", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  code: text("code").unique().notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  severity: text("severity").notNull(),
  suggestedAction: text("suggested_action"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// Master Data - Facilities
// ==========================================

export const room = pgTable("room", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  code: text("code").unique().notNull(),
  floor: text("floor"),
  capacity: integer("capacity").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hdMachine = pgTable("hd_machine", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  serialNumber: text("serial_number").unique().notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  roomId: text("room_id").references(() => room.id),
  purchaseDate: timestamp("purchase_date"),
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  status: text("status").default("available").notNull(),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shift = pgTable("shift", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  maxPatients: integer("max_patients"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// Master Data - Staff
// ==========================================

export const doctor = pgTable("doctor", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  nip: text("nip").unique(),
  sip: text("sip").unique(),
  specialization: text("specialization"),
  licenseExpiry: timestamp("license_expiry"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const nurse = pgTable("nurse", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  nip: text("nip").unique(),
  sip: text("sip").unique(),
  certification: text("certification"),
  certificationExpiry: timestamp("certification_expiry"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// Master Data - Patients
// ==========================================

export const patient = pgTable("patient", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  medicalRecordNumber: text("medical_record_number").unique().notNull(),
  name: text("name").notNull(),
  nik: text("nik").unique(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  bloodType: text("blood_type"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelation: text("emergency_contact_relation"),
  primaryDiagnosis: text("primary_diagnosis"),
  hdStartDate: timestamp("hd_start_date"),
  vascularAccessType: text("vascular_access_type"),
  vascularAccessSite: text("vascular_access_site"),
  dryWeight: integer("dry_weight"),
  insuranceType: text("insurance_type"),
  insuranceNumber: text("insurance_number"),
  userId: text("user_id").references(() => user.id),
  primaryDoctorId: text("primary_doctor_id").references(() => doctor.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const patientDiagnosis = pgTable("patient_diagnosis", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .notNull()
    .references(() => patient.id, { onDelete: "cascade" }),
  diagnosisId: text("diagnosis_id")
    .notNull()
    .references(() => diagnosis.id),
  diagnosisType: text("diagnosis_type").notNull(),
  diagnosedAt: timestamp("diagnosed_at").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const patientMedication = pgTable("patient_medication", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .notNull()
    .references(() => patient.id, { onDelete: "cascade" }),
  medicationId: text("medication_id")
    .notNull()
    .references(() => medication.id),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  route: text("route").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  prescribedById: text("prescribed_by_id").references(() => doctor.id),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// Scheduling - Jadwal Kerja Perawat & Pasien
// ==========================================

// Jadwal kerja perawat per shift
export const nurseSchedule = pgTable(
  "nurse_schedule",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    nurseId: text("nurse_id")
      .notNull()
      .references(() => nurse.id, { onDelete: "cascade" }),
    shiftId: text("shift_id")
      .notNull()
      .references(() => shift.id, { onDelete: "cascade" }),
    scheduleDate: timestamp("schedule_date").notNull(),
    roomId: text("room_id").references(() => room.id),
    status: text("status").default("scheduled").notNull(), // scheduled, present, absent, leave
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.nurseId, table.shiftId, table.scheduleDate)]
);

// Jadwal pasien per shift (untuk sesi HD)
export const patientSchedule = pgTable(
  "patient_schedule",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    patientId: text("patient_id")
      .notNull()
      .references(() => patient.id, { onDelete: "cascade" }),
    shiftId: text("shift_id")
      .notNull()
      .references(() => shift.id, { onDelete: "cascade" }),
    scheduleDate: timestamp("schedule_date").notNull(),
    roomId: text("room_id").references(() => room.id),
    machineId: text("machine_id").references(() => hdMachine.id),
    nurseId: text("nurse_id").references(() => nurse.id), // Perawat yang ditugaskan
    status: text("status").default("scheduled").notNull(), // scheduled, confirmed, in_progress, completed, cancelled, no_show
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.patientId, table.shiftId, table.scheduleDate)]
);

// ==========================================
// Google Calendar Integration
// ==========================================

// User's Google Calendar OAuth tokens
export const googleCalendarToken = pgTable("google_calendar_token", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  calendarId: text("calendar_id").default("primary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Mapping between local schedules and Google Calendar events
export const googleCalendarSync = pgTable(
  "google_calendar_sync",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    scheduleType: text("schedule_type").notNull(), // "nurse" or "patient"
    scheduleId: text("schedule_id").notNull(),
    googleEventId: text("google_event_id").notNull(),
    lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.userId, table.scheduleType, table.scheduleId)]
);
