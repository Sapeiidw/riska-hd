import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  user,
  account,
  role,
  permission,
  rolePermission,
  doctor,
  nurse,
  patient,
  room,
  hdMachine,
  shift,
  diagnosis,
  medication,
  hdProtocol,
  patientDiagnosis,
  patientMedication,
} from "../src/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Helper untuk hash password sederhana (untuk demo saja)
// Di production, gunakan bcrypt dari better-auth
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ==========================================
// Data Seed
// ==========================================

const DIAGNOSES_DATA = [
  { icdCode: "N18.5", name: "Chronic Kidney Disease Stage 5", category: "Nephrology", description: "Gagal ginjal kronik stadium 5" },
  { icdCode: "N18.4", name: "Chronic Kidney Disease Stage 4", category: "Nephrology", description: "Gagal ginjal kronik stadium 4" },
  { icdCode: "I10", name: "Essential Hypertension", category: "Cardiology", description: "Hipertensi esensial" },
  { icdCode: "E11.65", name: "Type 2 Diabetes with Hyperglycemia", category: "Endocrinology", description: "Diabetes melitus tipe 2 dengan hiperglikemia" },
  { icdCode: "E11.22", name: "Type 2 Diabetes with Diabetic CKD", category: "Endocrinology", description: "Diabetes melitus tipe 2 dengan nefropati diabetik" },
  { icdCode: "I50.9", name: "Heart Failure, Unspecified", category: "Cardiology", description: "Gagal jantung" },
  { icdCode: "D63.1", name: "Anemia in Chronic Kidney Disease", category: "Hematology", description: "Anemia pada penyakit ginjal kronik" },
  { icdCode: "E83.52", name: "Hypercalcemia", category: "Metabolic", description: "Hiperkalsemia" },
  { icdCode: "E87.5", name: "Hyperkalemia", category: "Metabolic", description: "Hiperkalemia" },
  { icdCode: "N17.9", name: "Acute Kidney Failure", category: "Nephrology", description: "Gagal ginjal akut" },
];

const MEDICATIONS_DATA = [
  { name: "Epoetin Alfa", genericName: "Erythropoietin", category: "Antianemic", unit: "IU", defaultDosage: "4000 IU", route: "SC/IV", notes: "Untuk anemia pada CKD" },
  { name: "Heparin Sodium", genericName: "Heparin", category: "Anticoagulant", unit: "IU", defaultDosage: "5000 IU", route: "IV", notes: "Antikoagulan selama HD" },
  { name: "Calcium Carbite", genericName: "Calcium Carbonate", category: "Phosphate Binder", unit: "mg", defaultDosage: "500 mg", route: "PO", notes: "Pengikat fosfat" },
  { name: "Calcitriol", genericName: "Calcitriol", category: "Vitamin D", unit: "mcg", defaultDosage: "0.25 mcg", route: "PO", notes: "Suplementasi vitamin D" },
  { name: "Amlodipine", genericName: "Amlodipine", category: "Antihypertensive", unit: "mg", defaultDosage: "5 mg", route: "PO", notes: "Antihipertensi" },
  { name: "Furosemide", genericName: "Furosemide", category: "Diuretic", unit: "mg", defaultDosage: "40 mg", route: "PO/IV", notes: "Diuretik loop" },
  { name: "Iron Sucrose", genericName: "Iron Sucrose", category: "Iron Supplement", unit: "mg", defaultDosage: "100 mg", route: "IV", notes: "Suplementasi zat besi IV" },
  { name: "Sevelamer", genericName: "Sevelamer Carbonate", category: "Phosphate Binder", unit: "mg", defaultDosage: "800 mg", route: "PO", notes: "Pengikat fosfat non-kalsium" },
  { name: "Metoprolol", genericName: "Metoprolol Tartrate", category: "Beta Blocker", unit: "mg", defaultDosage: "50 mg", route: "PO", notes: "Beta blocker untuk hipertensi" },
  { name: "Omeprazole", genericName: "Omeprazole", category: "PPI", unit: "mg", defaultDosage: "20 mg", route: "PO", notes: "Proteksi lambung" },
];

const PROTOCOLS_DATA = [
  { name: "Standard HD 4 Jam", dialyzerType: "High-Flux", bloodFlowRate: 300, dialysateFlowRate: 500, duration: 240, ufGoal: 2000, anticoagulant: "Heparin", anticoagulantDose: "5000 IU bolus + 1000 IU/jam", dialysateType: "Bicarbonate", dialysateTemperature: 37, sodiumLevel: 140, potassiumLevel: 2, calciumLevel: 3 },
  { name: "Standard HD 5 Jam", dialyzerType: "High-Flux", bloodFlowRate: 350, dialysateFlowRate: 500, duration: 300, ufGoal: 3000, anticoagulant: "Heparin", anticoagulantDose: "5000 IU bolus + 1000 IU/jam", dialysateType: "Bicarbonate", dialysateTemperature: 37, sodiumLevel: 140, potassiumLevel: 2, calciumLevel: 3 },
  { name: "Low-Flux HD", dialyzerType: "Low-Flux", bloodFlowRate: 250, dialysateFlowRate: 500, duration: 240, ufGoal: 1500, anticoagulant: "Heparin", anticoagulantDose: "3000 IU bolus", dialysateType: "Bicarbonate", dialysateTemperature: 37, sodiumLevel: 138, potassiumLevel: 2, calciumLevel: 3 },
  { name: "Heparin-Free HD", dialyzerType: "High-Flux", bloodFlowRate: 300, dialysateFlowRate: 500, duration: 180, ufGoal: 1500, anticoagulant: "Saline Flush", anticoagulantDose: "100ml setiap 30 menit", dialysateType: "Bicarbonate", dialysateTemperature: 36, sodiumLevel: 140, potassiumLevel: 2, calciumLevel: 3, notes: "Untuk pasien risiko perdarahan tinggi" },
  { name: "Sodium Profiling HD", dialyzerType: "High-Flux", bloodFlowRate: 300, dialysateFlowRate: 500, duration: 240, ufGoal: 2500, anticoagulant: "Heparin", anticoagulantDose: "5000 IU bolus", dialysateType: "Bicarbonate", dialysateTemperature: 36, sodiumLevel: 145, potassiumLevel: 2, calciumLevel: 3, notes: "Sodium profiling untuk pasien hipotensi intradialitik" },
];

const ROOMS_DATA = [
  { name: "Ruang HD A", code: "HD-A", floor: "Lantai 1", capacity: 10, description: "Ruang HD reguler" },
  { name: "Ruang HD B", code: "HD-B", floor: "Lantai 1", capacity: 8, description: "Ruang HD reguler" },
  { name: "Ruang HD Isolasi", code: "HD-ISO", floor: "Lantai 2", capacity: 4, description: "Ruang HD untuk pasien isolasi (HBV, HCV)" },
  { name: "Ruang HD VIP", code: "HD-VIP", floor: "Lantai 2", capacity: 4, description: "Ruang HD VIP dengan fasilitas tambahan" },
];

const SHIFTS_DATA = [
  { name: "Shift Pagi", startTime: "06:00", endTime: "11:00", maxPatients: 20 },
  { name: "Shift Siang", startTime: "11:00", endTime: "16:00", maxPatients: 20 },
  { name: "Shift Sore", startTime: "16:00", endTime: "21:00", maxPatients: 15 },
  { name: "Shift Malam", startTime: "21:00", endTime: "02:00", maxPatients: 10 },
];

const MACHINES_DATA = [
  { serialNumber: "FMC-2024-001", brand: "Fresenius", model: "5008S CorDiax" },
  { serialNumber: "FMC-2024-002", brand: "Fresenius", model: "5008S CorDiax" },
  { serialNumber: "FMC-2024-003", brand: "Fresenius", model: "5008S CorDiax" },
  { serialNumber: "NKK-2024-001", brand: "Nikkiso", model: "DBB-EXA" },
  { serialNumber: "NKK-2024-002", brand: "Nikkiso", model: "DBB-EXA" },
  { serialNumber: "BXT-2024-001", brand: "Baxter", model: "AK 98" },
  { serialNumber: "BXT-2024-002", brand: "Baxter", model: "AK 98" },
  { serialNumber: "NIP-2024-001", brand: "Nipro", model: "SURDIAL X" },
  { serialNumber: "NIP-2024-002", brand: "Nipro", model: "SURDIAL X" },
  { serialNumber: "FMC-2023-001", brand: "Fresenius", model: "4008S Classic" },
  { serialNumber: "FMC-2023-002", brand: "Fresenius", model: "4008S Classic" },
  { serialNumber: "BRN-2024-001", brand: "B. Braun", model: "Dialog+" },
];

const DOCTORS_DATA = [
  { name: "dr. Ahmad Faisal, Sp.PD-KGH", email: "dr.ahmad@riskahd.com", nip: "19800515200901001", sip: "SIP-PD-KGH-001", specialization: "Konsultan Ginjal Hipertensi" },
  { name: "dr. Siti Rahma, Sp.PD", email: "dr.siti@riskahd.com", nip: "19850320201001002", sip: "SIP-PD-002", specialization: "Penyakit Dalam - Nefrologi" },
  { name: "dr. Budi Santoso, Sp.PD-KGH", email: "dr.budi@riskahd.com", nip: "19780812199901003", sip: "SIP-PD-KGH-003", specialization: "Konsultan Ginjal Hipertensi" },
  { name: "dr. Dewi Kartika, Sp.PD", email: "dr.dewi@riskahd.com", nip: "19900105201501004", sip: "SIP-PD-004", specialization: "Penyakit Dalam - Transplantasi" },
];

const NURSES_DATA = [
  { name: "Ns. Ratna Sari, S.Kep", email: "ns.ratna@riskahd.com", nip: "19880315201001001", sip: "SIP-NS-001", certification: "Certified Dialysis Nurse (CDN)" },
  { name: "Ns. Yusuf Rahman, S.Kep", email: "ns.yusuf@riskahd.com", nip: "19850720200901002", sip: "SIP-NS-002", certification: "Vascular Access Care Specialist" },
  { name: "Ns. Linda Permata, S.Kep", email: "ns.linda@riskahd.com", nip: "19920101201501003", sip: "SIP-NS-003", certification: "Certified Dialysis Nurse (CDN)" },
  { name: "Ns. Andi Wijaya, S.Kep", email: "ns.andi@riskahd.com", nip: "19870610200801004", sip: "SIP-NS-004", certification: "Emergency & Critical Care" },
  { name: "Ns. Maya Kusuma, S.Kep", email: "ns.maya@riskahd.com", nip: "19930505201701005", sip: "SIP-NS-005", certification: "Certified Dialysis Nurse (CDN)" },
  { name: "Ns. Doni Prasetyo, S.Kep", email: "ns.doni@riskahd.com", nip: "19890825201201006", sip: "SIP-NS-006", certification: "Hemodialysis Technician" },
];

const PATIENTS_DATA = [
  { name: "Siti Aminah", nik: "3275014501650001", gender: "female", bloodType: "A+", phone: "081234567801", address: "Jl. Melati No. 15", city: "Jakarta", province: "DKI Jakarta", primaryDiagnosis: "CKD Stage 5", vascularAccessType: "AVF", vascularAccessSite: "Left Forearm", dryWeight: 55, insuranceType: "BPJS", hdStartDate: "2022-03-15" },
  { name: "Ahmad Wijaya", nik: "3275011505700002", gender: "male", bloodType: "B+", phone: "081234567802", address: "Jl. Anggrek No. 23", city: "Jakarta", province: "DKI Jakarta", primaryDiagnosis: "CKD Stage 5 + DM Type 2", vascularAccessType: "AVF", vascularAccessSite: "Right Forearm", dryWeight: 68, insuranceType: "BPJS", hdStartDate: "2021-08-20" },
  { name: "Dewi Lestari", nik: "3275012008750003", gender: "female", bloodType: "O+", phone: "081234567803", address: "Jl. Mawar No. 8", city: "Bekasi", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 5 + Hypertension", vascularAccessType: "AVG", vascularAccessSite: "Left Upper Arm", dryWeight: 52, insuranceType: "Asuransi Swasta", hdStartDate: "2023-01-10" },
  { name: "Bambang Susilo", nik: "3275010303680004", gender: "male", bloodType: "AB+", phone: "081234567804", address: "Jl. Kenanga No. 45", city: "Tangerang", province: "Banten", primaryDiagnosis: "CKD Stage 5", vascularAccessType: "CDL", vascularAccessSite: "Right Jugular", dryWeight: 72, insuranceType: "BPJS", hdStartDate: "2024-02-01" },
  { name: "Rina Kartini", nik: "3275015512800005", gender: "female", bloodType: "B-", phone: "081234567805", address: "Jl. Dahlia No. 12", city: "Depok", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 5 + Heart Failure", vascularAccessType: "AVF", vascularAccessSite: "Left Forearm", dryWeight: 48, insuranceType: "BPJS", hdStartDate: "2022-11-05" },
  { name: "Hendra Pratama", nik: "3275010708720006", gender: "male", bloodType: "A-", phone: "081234567806", address: "Jl. Flamboyan No. 31", city: "Bogor", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 4", vascularAccessType: "AVF", vascularAccessSite: "Right Forearm", dryWeight: 65, insuranceType: "Mandiri", hdStartDate: "2023-06-15" },
  { name: "Sri Wahyuni", nik: "3275013004780007", gender: "female", bloodType: "O-", phone: "081234567807", address: "Jl. Sakura No. 7", city: "Jakarta", province: "DKI Jakarta", primaryDiagnosis: "CKD Stage 5 + Anemia", vascularAccessType: "AVF", vascularAccessSite: "Left Forearm", dryWeight: 50, insuranceType: "BPJS", hdStartDate: "2021-12-20" },
  { name: "Agus Setiawan", nik: "3275011201650008", gender: "male", bloodType: "B+", phone: "081234567808", address: "Jl. Teratai No. 19", city: "Jakarta", province: "DKI Jakarta", primaryDiagnosis: "CKD Stage 5 + DM Type 2 + Hypertension", vascularAccessType: "AVG", vascularAccessSite: "Left Upper Arm", dryWeight: 78, insuranceType: "BPJS", hdStartDate: "2020-05-10" },
  { name: "Nurhasanah", nik: "3275012505850009", gender: "female", bloodType: "A+", phone: "081234567809", address: "Jl. Cemara No. 25", city: "Bekasi", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 5", vascularAccessType: "AVF", vascularAccessSite: "Right Forearm", dryWeight: 58, insuranceType: "Asuransi Swasta", hdStartDate: "2023-09-01" },
  { name: "Rudi Hartono", nik: "3275010606700010", gender: "male", bloodType: "O+", phone: "081234567810", address: "Jl. Pinus No. 33", city: "Tangerang", province: "Banten", primaryDiagnosis: "CKD Stage 5 + Hyperkalemia", vascularAccessType: "CDL", vascularAccessSite: "Left Femoral", dryWeight: 70, insuranceType: "BPJS", hdStartDate: "2024-01-15" },
  { name: "Yanti Susanti", nik: "3275014408820011", gender: "female", bloodType: "AB-", phone: "081234567811", address: "Jl. Akasia No. 5", city: "Depok", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 5 + SLE", vascularAccessType: "AVF", vascularAccessSite: "Left Forearm", dryWeight: 45, insuranceType: "BPJS", hdStartDate: "2022-07-20" },
  { name: "Dedi Kurniawan", nik: "3275011809750012", gender: "male", bloodType: "B+", phone: "081234567812", address: "Jl. Beringin No. 41", city: "Bogor", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 5 + Polycystic Kidney", vascularAccessType: "AVF", vascularAccessSite: "Right Forearm", dryWeight: 75, insuranceType: "Mandiri", hdStartDate: "2021-04-05" },
  { name: "Ani Wulandari", nik: "3275012212880013", gender: "female", bloodType: "A+", phone: "081234567813", address: "Jl. Cendana No. 17", city: "Jakarta", province: "DKI Jakarta", primaryDiagnosis: "CKD Stage 5 + Hepatitis B", vascularAccessType: "AVF", vascularAccessSite: "Left Forearm", dryWeight: 53, insuranceType: "BPJS", hdStartDate: "2023-03-10" },
  { name: "Joko Purnomo", nik: "3275010101600014", gender: "male", bloodType: "O+", phone: "081234567814", address: "Jl. Mahoni No. 28", city: "Jakarta", province: "DKI Jakarta", primaryDiagnosis: "CKD Stage 5", vascularAccessType: "AVG", vascularAccessSite: "Right Upper Arm", dryWeight: 82, insuranceType: "BPJS", hdStartDate: "2020-11-25" },
  { name: "Lina Marlina", nik: "3275015003830015", gender: "female", bloodType: "B-", phone: "081234567815", address: "Jl. Jambu No. 9", city: "Bekasi", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 5 + Pregnancy History", vascularAccessType: "AVF", vascularAccessSite: "Left Forearm", dryWeight: 56, insuranceType: "Asuransi Swasta", hdStartDate: "2022-09-15" },
];

// ==========================================
// Seeder Functions
// ==========================================

async function seedDiagnoses() {
  console.log("\n📋 Seeding diagnoses...");
  const insertedIds: Record<string, string> = {};

  for (const data of DIAGNOSES_DATA) {
    const existing = await db.select().from(diagnosis).where(eq(diagnosis.icdCode, data.icdCode!)).limit(1);

    if (existing.length === 0) {
      const result = await db.insert(diagnosis).values({
        id: createId(),
        ...data,
        isActive: true,
      }).returning();
      insertedIds[data.icdCode!] = result[0].id;
      console.log(`  ✓ Created diagnosis: ${data.name}`);
    } else {
      insertedIds[data.icdCode!] = existing[0].id;
      console.log(`  - Diagnosis exists: ${data.name}`);
    }
  }

  console.log(`✅ Diagnoses seeded: ${DIAGNOSES_DATA.length}`);
  return insertedIds;
}

async function seedMedications() {
  console.log("\n💊 Seeding medications...");
  const insertedIds: Record<string, string> = {};

  for (const data of MEDICATIONS_DATA) {
    const existing = await db.select().from(medication).where(eq(medication.name, data.name)).limit(1);

    if (existing.length === 0) {
      const result = await db.insert(medication).values({
        id: createId(),
        ...data,
        isActive: true,
      }).returning();
      insertedIds[data.name] = result[0].id;
      console.log(`  ✓ Created medication: ${data.name}`);
    } else {
      insertedIds[data.name] = existing[0].id;
      console.log(`  - Medication exists: ${data.name}`);
    }
  }

  console.log(`✅ Medications seeded: ${MEDICATIONS_DATA.length}`);
  return insertedIds;
}

async function seedProtocols() {
  console.log("\n📝 Seeding HD protocols...");

  for (const data of PROTOCOLS_DATA) {
    const existing = await db.select().from(hdProtocol).where(eq(hdProtocol.name, data.name)).limit(1);

    if (existing.length === 0) {
      await db.insert(hdProtocol).values({
        id: createId(),
        ...data,
        isActive: true,
      });
      console.log(`  ✓ Created protocol: ${data.name}`);
    } else {
      console.log(`  - Protocol exists: ${data.name}`);
    }
  }

  console.log(`✅ Protocols seeded: ${PROTOCOLS_DATA.length}`);
}

async function seedRooms() {
  console.log("\n🏥 Seeding rooms...");
  const insertedIds: Record<string, string> = {};

  for (const data of ROOMS_DATA) {
    const existing = await db.select().from(room).where(eq(room.code, data.code)).limit(1);

    if (existing.length === 0) {
      const result = await db.insert(room).values({
        id: createId(),
        ...data,
        isActive: true,
      }).returning();
      insertedIds[data.code] = result[0].id;
      console.log(`  ✓ Created room: ${data.name}`);
    } else {
      insertedIds[data.code] = existing[0].id;
      console.log(`  - Room exists: ${data.name}`);
    }
  }

  console.log(`✅ Rooms seeded: ${ROOMS_DATA.length}`);
  return insertedIds;
}

async function seedShifts() {
  console.log("\n⏰ Seeding shifts...");

  for (const data of SHIFTS_DATA) {
    const existing = await db.select().from(shift).where(eq(shift.name, data.name)).limit(1);

    if (existing.length === 0) {
      await db.insert(shift).values({
        id: createId(),
        ...data,
        isActive: true,
      });
      console.log(`  ✓ Created shift: ${data.name}`);
    } else {
      console.log(`  - Shift exists: ${data.name}`);
    }
  }

  console.log(`✅ Shifts seeded: ${SHIFTS_DATA.length}`);
}

async function seedMachines(roomIds: Record<string, string>) {
  console.log("\n🔧 Seeding HD machines...");
  const roomCodes = Object.keys(roomIds);

  for (let i = 0; i < MACHINES_DATA.length; i++) {
    const data = MACHINES_DATA[i];
    const existing = await db.select().from(hdMachine).where(eq(hdMachine.serialNumber, data.serialNumber)).limit(1);

    if (existing.length === 0) {
      // Assign to rooms in round-robin
      const roomCode = roomCodes[i % roomCodes.length];
      const purchaseDate = new Date();
      purchaseDate.setMonth(purchaseDate.getMonth() - Math.floor(Math.random() * 24));

      const lastMaintenance = new Date();
      lastMaintenance.setMonth(lastMaintenance.getMonth() - Math.floor(Math.random() * 3));

      const nextMaintenance = new Date(lastMaintenance);
      nextMaintenance.setMonth(nextMaintenance.getMonth() + 3);

      await db.insert(hdMachine).values({
        id: createId(),
        ...data,
        roomId: roomIds[roomCode],
        purchaseDate,
        lastMaintenanceDate: lastMaintenance,
        nextMaintenanceDate: nextMaintenance,
        status: "available",
        isActive: true,
      });
      console.log(`  ✓ Created machine: ${data.serialNumber} (${data.brand} ${data.model})`);
    } else {
      console.log(`  - Machine exists: ${data.serialNumber}`);
    }
  }

  console.log(`✅ Machines seeded: ${MACHINES_DATA.length}`);
}

async function createUserWithAccount(
  userData: { name: string; email: string; role: string },
  password: string
): Promise<string> {
  const existing = await db.select().from(user).where(eq(user.email, userData.email)).limit(1);

  if (existing.length > 0) {
    console.log(`  - User exists: ${userData.email}`);
    return existing[0].id;
  }

  const userId = createId();
  const now = new Date();
  const hashedPassword = await hashPassword(password);

  await db.insert(user).values({
    id: userId,
    name: userData.name,
    email: userData.email,
    emailVerified: true,
    role: userData.role,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(account).values({
    id: createId(),
    accountId: userId,
    providerId: "credential",
    userId: userId,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`  ✓ Created user: ${userData.email}`);
  return userId;
}

async function seedDoctors() {
  console.log("\n👨‍⚕️ Seeding doctors...");
  const doctorIds: string[] = [];
  const defaultPassword = "password123";

  for (const data of DOCTORS_DATA) {
    const existing = await db.select().from(doctor).where(eq(doctor.nip, data.nip!)).limit(1);

    if (existing.length === 0) {
      const userId = await createUserWithAccount(
        { name: data.name, email: data.email, role: "doctor" },
        defaultPassword
      );

      const licenseExpiry = new Date();
      licenseExpiry.setFullYear(licenseExpiry.getFullYear() + 3);

      const result = await db.insert(doctor).values({
        id: createId(),
        userId,
        nip: data.nip,
        sip: data.sip,
        specialization: data.specialization,
        licenseExpiry,
        isActive: true,
      }).returning();

      doctorIds.push(result[0].id);
      console.log(`  ✓ Created doctor: ${data.name}`);
    } else {
      doctorIds.push(existing[0].id);
      console.log(`  - Doctor exists: ${data.name}`);
    }
  }

  console.log(`✅ Doctors seeded: ${DOCTORS_DATA.length}`);
  return doctorIds;
}

async function seedNurses() {
  console.log("\n👩‍⚕️ Seeding nurses...");
  const defaultPassword = "password123";

  for (const data of NURSES_DATA) {
    const existing = await db.select().from(nurse).where(eq(nurse.nip, data.nip!)).limit(1);

    if (existing.length === 0) {
      const userId = await createUserWithAccount(
        { name: data.name, email: data.email, role: "nurse" },
        defaultPassword
      );

      const certExpiry = new Date();
      certExpiry.setFullYear(certExpiry.getFullYear() + 2);

      await db.insert(nurse).values({
        id: createId(),
        userId,
        nip: data.nip,
        sip: data.sip,
        certification: data.certification,
        certificationExpiry: certExpiry,
        isActive: true,
      });

      console.log(`  ✓ Created nurse: ${data.name}`);
    } else {
      console.log(`  - Nurse exists: ${data.name}`);
    }
  }

  console.log(`✅ Nurses seeded: ${NURSES_DATA.length}`);
}

async function seedPatients(doctorIds: string[], diagnosisIds: Record<string, string>, medicationIds: Record<string, string>) {
  console.log("\n🏥 Seeding patients...");
  let mrNumber = 1000;

  for (const data of PATIENTS_DATA) {
    const existing = await db.select().from(patient).where(eq(patient.nik, data.nik!)).limit(1);

    if (existing.length === 0) {
      mrNumber++;
      const medicalRecordNumber = `MR-${new Date().getFullYear()}-${String(mrNumber).padStart(4, "0")}`;

      // Random assign primary doctor
      const primaryDoctorId = doctorIds[Math.floor(Math.random() * doctorIds.length)];

      // Calculate date of birth (age 40-75)
      const age = 40 + Math.floor(Math.random() * 35);
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - age);
      dob.setMonth(Math.floor(Math.random() * 12));
      dob.setDate(1 + Math.floor(Math.random() * 28));

      const hdStartDate = new Date(data.hdStartDate);

      const result = await db.insert(patient).values({
        id: createId(),
        medicalRecordNumber,
        name: data.name,
        nik: data.nik,
        dateOfBirth: dob,
        gender: data.gender,
        bloodType: data.bloodType,
        phone: data.phone,
        address: data.address,
        city: data.city,
        province: data.province,
        emergencyContactName: `Keluarga ${data.name.split(" ")[0]}`,
        emergencyContactPhone: data.phone?.replace(/801/, "901"),
        emergencyContactRelation: data.gender === "female" ? "Suami" : "Istri",
        primaryDiagnosis: data.primaryDiagnosis,
        hdStartDate,
        vascularAccessType: data.vascularAccessType,
        vascularAccessSite: data.vascularAccessSite,
        dryWeight: data.dryWeight,
        insuranceType: data.insuranceType,
        insuranceNumber: `INS-${data.nik?.slice(-6)}`,
        primaryDoctorId,
        isActive: true,
      }).returning();

      const patientId = result[0].id;

      // Add CKD diagnosis
      await db.insert(patientDiagnosis).values({
        id: createId(),
        patientId,
        diagnosisId: diagnosisIds["N18.5"],
        diagnosisType: "primary",
        diagnosedAt: hdStartDate,
        notes: "Diagnosa utama saat mulai HD",
      });

      // Add random secondary diagnoses
      const secondaryDiagnoses = ["I10", "E11.65", "D63.1"].slice(0, 1 + Math.floor(Math.random() * 2));
      for (const icdCode of secondaryDiagnoses) {
        if (diagnosisIds[icdCode]) {
          await db.insert(patientDiagnosis).values({
            id: createId(),
            patientId,
            diagnosisId: diagnosisIds[icdCode],
            diagnosisType: "secondary",
            diagnosedAt: hdStartDate,
          });
        }
      }

      // Add routine medications
      const routineMeds = ["Epoetin Alfa", "Calcium Carbite", "Amlodipine"].slice(0, 2 + Math.floor(Math.random() * 2));
      for (const medName of routineMeds) {
        if (medicationIds[medName]) {
          const med = MEDICATIONS_DATA.find(m => m.name === medName);
          await db.insert(patientMedication).values({
            id: createId(),
            patientId,
            medicationId: medicationIds[medName],
            dosage: med?.defaultDosage || "1 tab",
            frequency: medName === "Epoetin Alfa" ? "3x seminggu" : "1x sehari",
            route: med?.route || "PO",
            startDate: hdStartDate,
            prescribedById: primaryDoctorId,
            isActive: true,
          });
        }
      }

      console.log(`  ✓ Created patient: ${data.name} (${medicalRecordNumber})`);
    } else {
      console.log(`  - Patient exists: ${data.name}`);
    }
  }

  console.log(`✅ Patients seeded: ${PATIENTS_DATA.length}`);
}

async function seedAdminUser() {
  console.log("\n👤 Seeding admin user...");
  const adminEmail = "admin@riskahd.com";
  const defaultPassword = "admin123";

  await createUserWithAccount(
    { name: "Administrator", email: adminEmail, role: "admin" },
    defaultPassword
  );

  console.log(`✅ Admin user created: ${adminEmail} / ${defaultPassword}`);
}

async function main() {
  console.log("🚀 Starting RISKA HD Demo Seeder...\n");
  console.log("=".repeat(50));

  try {
    // Seed master data
    const diagnosisIds = await seedDiagnoses();
    const medicationIds = await seedMedications();
    await seedProtocols();
    const roomIds = await seedRooms();
    await seedShifts();
    await seedMachines(roomIds);

    // Seed users (doctors, nurses, admin)
    await seedAdminUser();
    const doctorIds = await seedDoctors();
    await seedNurses();

    // Seed patients with diagnoses and medications
    await seedPatients(doctorIds, diagnosisIds, medicationIds);

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Demo seeding completed successfully!\n");

    console.log("📊 Summary:");
    console.log(`   - Diagnoses: ${DIAGNOSES_DATA.length}`);
    console.log(`   - Medications: ${MEDICATIONS_DATA.length}`);
    console.log(`   - Protocols: ${PROTOCOLS_DATA.length}`);
    console.log(`   - Rooms: ${ROOMS_DATA.length}`);
    console.log(`   - Shifts: ${SHIFTS_DATA.length}`);
    console.log(`   - Machines: ${MACHINES_DATA.length}`);
    console.log(`   - Doctors: ${DOCTORS_DATA.length}`);
    console.log(`   - Nurses: ${NURSES_DATA.length}`);
    console.log(`   - Patients: ${PATIENTS_DATA.length}`);

    console.log("\n🔐 Demo Login Accounts:");
    console.log("   Admin:  admin@riskahd.com / admin123");
    console.log("   Doctor: dr.ahmad@riskahd.com / password123");
    console.log("   Nurse:  ns.ratna@riskahd.com / password123");

  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
