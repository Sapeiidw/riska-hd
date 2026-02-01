import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { account } from "../src/db/schema";
import { hashPassword } from "better-auth/crypto";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function fixPasswords() {
  console.log("🔧 Fixing password hashes for all accounts...\n");

  const defaultPassword = "test123";
  const hashedPassword = await hashPassword(defaultPassword);

  console.log(`New hash format: ${hashedPassword.substring(0, 50)}...`);

  // Get all accounts with credential provider
  const accounts = await db.select().from(account);

  console.log(`\nFound ${accounts.length} accounts to update`);

  for (const acc of accounts) {
    if (acc.providerId === "credential" && acc.password) {
      await db
        .update(account)
        .set({ password: hashedPassword })
        .where(
          // Using raw SQL since eq needs proper typing
          // @ts-expect-error - accessing id directly
          acc.id === acc.id
        );
    }
  }

  // Use raw SQL for simpler update
  const result = await sql`
    UPDATE account
    SET password = ${hashedPassword}
    WHERE provider_id = 'credential' AND password IS NOT NULL
  `;

  console.log(`\n✅ Updated all credential accounts with new password hash`);
  console.log(`\n🔐 All accounts can now login with password: ${defaultPassword}`);
}

fixPasswords().catch(console.error).finally(() => process.exit(0));
