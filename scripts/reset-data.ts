import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient);

// Tables in order of deletion (respecting foreign key constraints)
const TABLES_TO_DELETE = [
  // HD Session related (most dependent)
  "hd_session_medication",
  "hd_session_complication",
  "hd_session",

  // Patient Lab Results
  "patient_lab_result",

  // Scheduling
  "google_calendar_sync",
  "google_calendar_token",
  "patient_schedule",
  "nurse_schedule",

  // Patient related
  "patient_medication",
  "patient_diagnosis",
  "patient",

  // Staff
  "nurse",
  "doctor",

  // Facilities
  "hd_machine",
  "room",
  "shift",

  // Medical references
  "complication",
  "hd_protocol",
  "medication",
  "diagnosis",

  // Content
  "ruang_informasi",

  // RBAC
  "role_permission",
  "permission",
  "role",

  // Audit
  "audit_log",

  // Auth (order matters due to FK)
  "session",
  "account",
  "verification",
  "user",
];

async function resetDatabase() {
  console.log("🗑️  Starting database reset...\n");
  console.log("=".repeat(50));
  console.log("⚠️  WARNING: This will DELETE ALL DATA!");
  console.log("=".repeat(50));
  console.log();

  let deletedCount = 0;
  let errorCount = 0;

  for (const table of TABLES_TO_DELETE) {
    try {
      const result = await db.execute(sql.raw(`DELETE FROM "${table}"`));
      const rowCount = result.rowCount || 0;
      if (rowCount > 0) {
        console.log(`  ✓ Deleted ${rowCount} rows from ${table}`);
        deletedCount += rowCount;
      } else {
        console.log(`  - ${table} (already empty)`);
      }
    } catch (error) {
      const err = error as Error;
      // Table might not exist, skip silently
      if (err.message?.includes("does not exist")) {
        console.log(`  ⚠ Table ${table} does not exist, skipping`);
      } else {
        console.error(`  ✗ Error deleting from ${table}:`, err.message);
        errorCount++;
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`🎉 Database reset completed!`);
  console.log(`   - Total rows deleted: ${deletedCount}`);
  if (errorCount > 0) {
    console.log(`   - Errors encountered: ${errorCount}`);
  }
  console.log();
  console.log("💡 Next steps:");
  console.log("   1. Run: npx tsx scripts/seed-permissions.ts");
  console.log("   2. Run: npx tsx scripts/seed-demo.ts");
  console.log();
}

async function main() {
  // Safety check - only allow in development or with explicit flag
  const args = process.argv.slice(2);
  const forceFlag = args.includes("--force");
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !forceFlag) {
    console.error("❌ Cannot reset production database without --force flag!");
    console.error("   Run: npx tsx scripts/reset-data.ts --force");
    process.exit(1);
  }

  if (forceFlag) {
    console.log("⚠️  Force flag detected. Proceeding with reset...\n");
  }

  try {
    await resetDatabase();
  } catch (error) {
    console.error("\n❌ Error during reset:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
