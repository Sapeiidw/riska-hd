import {
  boolean,
  index,
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
  nik: text("nik").unique(),
  isActivated: boolean("is_activated").default(false).notNull(),
});

export const session = pgTable(
  "session",
  {
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
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    index("session_expires_at_idx").on(table.expiresAt),
  ]
);

export const account = pgTable(
  "account",
  {
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
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_provider_idx").on(table.providerId, table.accountId),
  ]
);

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

export const auditLog = pgTable(
  "audit_log",
  {
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
  },
  (table) => [
    index("audit_log_user_id_idx").on(table.userId),
    index("audit_log_resource_idx").on(table.resource, table.resourceId),
    index("audit_log_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// Master Data - Medical References (defined first due to references)
// ==========================================

export const diagnosis = pgTable(
  "diagnosis",
  {
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
  },
  (table) => [
    index("diagnosis_category_idx").on(table.category),
    index("diagnosis_is_active_idx").on(table.isActive),
  ]
);

export const medication = pgTable(
  "medication",
  {
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
  },
  (table) => [
    index("medication_category_idx").on(table.category),
    index("medication_is_active_idx").on(table.isActive),
  ]
);

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

export const hdMachine = pgTable(
  "hd_machine",
  {
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
  },
  (table) => [
    index("hd_machine_room_id_idx").on(table.roomId),
    index("hd_machine_status_idx").on(table.status),
    index("hd_machine_is_active_idx").on(table.isActive),
  ]
);

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

export const doctor = pgTable(
  "doctor",
  {
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
  },
  (table) => [
    index("doctor_user_id_idx").on(table.userId),
    index("doctor_is_active_idx").on(table.isActive),
  ]
);

export const nurse = pgTable(
  "nurse",
  {
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
  },
  (table) => [
    index("nurse_user_id_idx").on(table.userId),
    index("nurse_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// Master Data - Patients
// ==========================================

export const patient = pgTable(
  "patient",
  {
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
  },
  (table) => [
    index("patient_user_id_idx").on(table.userId),
    index("patient_primary_doctor_id_idx").on(table.primaryDoctorId),
    index("patient_is_active_idx").on(table.isActive),
    index("patient_name_idx").on(table.name),
  ]
);

export const patientDiagnosis = pgTable(
  "patient_diagnosis",
  {
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
  },
  (table) => [
    index("patient_diagnosis_patient_id_idx").on(table.patientId),
    index("patient_diagnosis_diagnosis_id_idx").on(table.diagnosisId),
  ]
);

export const patientMedication = pgTable(
  "patient_medication",
  {
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
  },
  (table) => [
    index("patient_medication_patient_id_idx").on(table.patientId),
    index("patient_medication_medication_id_idx").on(table.medicationId),
    index("patient_medication_is_active_idx").on(table.isActive),
  ]
);

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
  (table) => [
    unique().on(table.nurseId, table.shiftId, table.scheduleDate),
    index("nurse_schedule_nurse_id_idx").on(table.nurseId),
    index("nurse_schedule_date_idx").on(table.scheduleDate),
    index("nurse_schedule_status_idx").on(table.status),
  ]
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
  (table) => [
    unique().on(table.patientId, table.shiftId, table.scheduleDate),
    index("patient_schedule_patient_id_idx").on(table.patientId),
    index("patient_schedule_date_idx").on(table.scheduleDate),
    index("patient_schedule_status_idx").on(table.status),
    index("patient_schedule_date_status_idx").on(table.scheduleDate, table.status),
  ]
);

// ==========================================
// Ruang Informasi (Information / Educational Content)
// ==========================================

export const ruangInformasi = pgTable(
  "ruang_informasi",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text("title").notNull(),
    slug: text("slug").unique().notNull(),
    category: text("category").notNull(), // artikel, video, panduan, pengumuman
    content: text("content").notNull(), // Rich text content (HTML/Markdown)
    excerpt: text("excerpt"), // Short description/summary
    imageUrl: text("image_url"), // Featured image URL
    videoUrl: text("video_url"), // Embedded video URL (YouTube, etc.)
    externalLinks: text("external_links"), // JSON array of external links
    authorId: text("author_id").references(() => user.id),
    publishedAt: timestamp("published_at"),
    isPublished: boolean("is_published").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("ruang_informasi_category_idx").on(table.category),
    index("ruang_informasi_is_published_idx").on(table.isPublished),
    index("ruang_informasi_published_at_idx").on(table.publishedAt),
  ]
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

// ==========================================
// HD Session Recording
// ==========================================

// Catatan sesi hemodialisa
export const hdSession = pgTable(
  "hd_session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    patientScheduleId: text("patient_schedule_id")
      .notNull()
      .references(() => patientSchedule.id, { onDelete: "cascade" }),
    patientId: text("patient_id")
      .notNull()
      .references(() => patient.id, { onDelete: "cascade" }),
    sessionDate: timestamp("session_date").notNull(),
    startTime: timestamp("start_time"),
    endTime: timestamp("end_time"),

    // Pra-HD Assessment
    preWeight: integer("pre_weight"), // BB pra-HD dalam gram
    preSystolic: integer("pre_systolic"), // TD sistolik pra-HD
    preDiastolic: integer("pre_diastolic"), // TD diastolik pra-HD
    prePulse: integer("pre_pulse"), // Nadi pra-HD
    preTemperature: integer("pre_temperature"), // Suhu pra-HD x10 (365 = 36.5)
    preComplaints: text("pre_complaints"), // Keluhan pra-HD

    // Parameter HD
    ufGoal: integer("uf_goal"), // Target UF dalam ml
    bloodFlow: integer("blood_flow"), // QB - blood flow rate ml/min
    dialysateFlow: integer("dialysate_flow"), // QD - dialysate flow rate ml/min
    tmp: integer("tmp"), // TMP - transmembrane pressure
    duration: integer("duration"), // Durasi dalam menit
    vascularAccess: text("vascular_access"), // Jenis akses vaskular (avf, avg, cvc, permcath)
    vascularAccessSite: text("vascular_access_site"), // Lokasi akses
    dialyzerType: text("dialyzer_type"), // Jenis dialyzer
    dialyzerReuse: integer("dialyzer_reuse"), // Jumlah reuse (0 = baru)
    anticoagulant: text("anticoagulant"), // Jenis antikoagulan
    anticoagulantDose: text("anticoagulant_dose"), // Dosis antikoagulan
    dialysateType: text("dialysate_type"), // Jenis dialisat
    dialysateTemperature: integer("dialysate_temperature"), // Suhu dialisat
    machineId: text("machine_id").references(() => hdMachine.id),
    hdProtocolId: text("hd_protocol_id").references(() => hdProtocol.id),

    // Pasca-HD Assessment
    postWeight: integer("post_weight"), // BB pasca-HD dalam gram
    postSystolic: integer("post_systolic"), // TD sistolik pasca-HD
    postDiastolic: integer("post_diastolic"), // TD diastolik pasca-HD
    postPulse: integer("post_pulse"), // Nadi pasca-HD
    actualUf: integer("actual_uf"), // Actual UF achieved dalam ml
    postNotes: text("post_notes"), // Catatan pasca-HD

    // Status & Audit
    status: text("status").default("in_progress").notNull(), // in_progress, completed, terminated
    recordedByNurseId: text("recorded_by_nurse_id")
      .notNull()
      .references(() => nurse.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("hd_session_patient_id_idx").on(table.patientId),
    index("hd_session_session_date_idx").on(table.sessionDate),
    index("hd_session_status_idx").on(table.status),
    index("hd_session_patient_schedule_id_idx").on(table.patientScheduleId),
    index("hd_session_recorded_by_nurse_id_idx").on(table.recordedByNurseId),
    index("hd_session_date_status_idx").on(table.sessionDate, table.status),
  ]
);

// Komplikasi yang terjadi selama sesi HD
export const hdSessionComplication = pgTable(
  "hd_session_complication",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    hdSessionId: text("hd_session_id")
      .notNull()
      .references(() => hdSession.id, { onDelete: "cascade" }),
    complicationId: text("complication_id")
      .notNull()
      .references(() => complication.id),
    occurredAt: timestamp("occurred_at").notNull(),
    action: text("action"), // Tindakan yang dilakukan
    notes: text("notes"),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("hd_session_complication_session_id_idx").on(table.hdSessionId),
    index("hd_session_complication_complication_id_idx").on(table.complicationId),
  ]
);

// Obat yang diberikan selama sesi HD
export const hdSessionMedication = pgTable(
  "hd_session_medication",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    hdSessionId: text("hd_session_id")
      .notNull()
      .references(() => hdSession.id, { onDelete: "cascade" }),
    medicationId: text("medication_id")
      .notNull()
      .references(() => medication.id),
    dosage: text("dosage").notNull(),
    route: text("route").notNull(),
    administeredAt: timestamp("administered_at").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("hd_session_medication_session_id_idx").on(table.hdSessionId),
    index("hd_session_medication_medication_id_idx").on(table.medicationId),
  ]
);

// ==========================================
// Patient Lab Results
// ==========================================

// Hasil laboratorium pasien (periodik)
export const patientLabResult = pgTable(
  "patient_lab_result",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    patientId: text("patient_id")
      .notNull()
      .references(() => patient.id, { onDelete: "cascade" }),
    testDate: timestamp("test_date").notNull(),
    reportDate: timestamp("report_date"),

    // Lab HD umum (disimpan x10 atau x100 untuk nilai desimal)
    hemoglobin: integer("hemoglobin"), // Hb x10 (125 = 12.5 g/dL)
    ureum: integer("ureum"), // mg/dL
    creatinine: integer("creatinine"), // x10 (85 = 8.5 mg/dL)
    potassium: integer("potassium"), // x10 (45 = 4.5 mEq/L)
    sodium: integer("sodium"), // mEq/L
    calcium: integer("calcium"), // x10 (95 = 9.5 mg/dL)
    phosphorus: integer("phosphorus"), // x10 (55 = 5.5 mg/dL)
    albumin: integer("albumin"), // x10 (35 = 3.5 g/dL)
    uricAcid: integer("uric_acid"), // x10 (70 = 7.0 mg/dL)

    // Dialysis adequacy
    ktv: integer("ktv"), // x100 (145 = 1.45)
    urr: integer("urr"), // x10 (750 = 75.0%)

    // Tambahan (flexible)
    additionalLabs: text("additional_labs"), // JSON string untuk lab lain
    labSource: text("lab_source"), // Sumber lab (nama RS/Lab)
    notes: text("notes"),

    enteredById: text("entered_by_id").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("patient_lab_result_patient_id_idx").on(table.patientId),
    index("patient_lab_result_test_date_idx").on(table.testDate),
    index("patient_lab_result_patient_test_date_idx").on(table.patientId, table.testDate),
  ]
);
