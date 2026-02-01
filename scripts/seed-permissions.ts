import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { permission, role, rolePermission, user } from "../src/db/schema";
import { ALL_PERMISSIONS, RESOURCES, ACTIONS } from "../src/lib/permissions/constants";
import { DEFAULT_ROLES } from "../src/lib/permissions/roles";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seedPermissions() {
  console.log("🌱 Seeding permissions...");

  // Create all permissions
  const permissionValues = Object.entries(RESOURCES).flatMap(([, resource]) =>
    Object.entries(ACTIONS).map(([, action]) => ({
      id: createId(),
      name: `${resource}:${action}`,
      resource,
      action,
      description: `${action} ${resource}`,
    }))
  );

  // Filter only permissions that exist in ALL_PERMISSIONS
  const validPermissions = permissionValues.filter((p) =>
    ALL_PERMISSIONS.includes(p.name as (typeof ALL_PERMISSIONS)[number])
  );

  for (const perm of validPermissions) {
    const existing = await db
      .select()
      .from(permission)
      .where(eq(permission.name, perm.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(permission).values(perm);
      console.log(`  ✓ Created permission: ${perm.name}`);
    } else {
      console.log(`  - Permission exists: ${perm.name}`);
    }
  }

  console.log(`\n✅ Permissions seeded: ${validPermissions.length} total`);
}

async function seedRoles() {
  console.log("\n🌱 Seeding roles...");

  for (const roleDef of DEFAULT_ROLES) {
    // Check if role exists
    const existing = await db
      .select()
      .from(role)
      .where(eq(role.name, roleDef.name))
      .limit(1);

    let roleId: string;

    if (existing.length === 0) {
      const newRole = await db
        .insert(role)
        .values({
          id: createId(),
          name: roleDef.name,
          displayName: roleDef.displayName,
          description: roleDef.description,
        })
        .returning();
      roleId = newRole[0].id;
      console.log(`  ✓ Created role: ${roleDef.displayName}`);
    } else {
      roleId = existing[0].id;
      console.log(`  - Role exists: ${roleDef.displayName}`);
    }

    // Add permissions to role
    for (const permName of roleDef.permissions) {
      const perm = await db
        .select()
        .from(permission)
        .where(eq(permission.name, permName))
        .limit(1);

      if (perm.length > 0) {
        const existingRolePerm = await db
          .select()
          .from(rolePermission)
          .where(eq(rolePermission.roleId, roleId))
          .limit(1);

        // Only add if role doesn't have permissions yet
        const hasThisPerm = await db
          .select()
          .from(rolePermission)
          .where(eq(rolePermission.roleId, roleId))
          .then((rps) => rps.some((rp) => rp.permissionId === perm[0].id));

        if (!hasThisPerm) {
          await db.insert(rolePermission).values({
            id: createId(),
            roleId,
            permissionId: perm[0].id,
          });
        }
      }
    }
  }

  console.log(`\n✅ Roles seeded: ${DEFAULT_ROLES.length} total`);
}

async function setAdminUser(email: string) {
  console.log(`\n🔐 Setting admin role for: ${email}`);

  const result = await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, email))
    .returning();

  if (result.length > 0) {
    console.log(`  ✓ User ${result[0].name} (${email}) is now admin`);
  } else {
    console.log(`  ✗ User with email ${email} not found`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || "admin@gmail.com";

  try {
    await seedPermissions();
    await seedRoles();
    await setAdminUser(email);

    console.log("\n🎉 Seeding completed!");
    console.log("\nRole permissions summary:");
    for (const roleDef of DEFAULT_ROLES) {
      console.log(`  - ${roleDef.displayName}: ${roleDef.permissions.length} permissions`);
    }
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
