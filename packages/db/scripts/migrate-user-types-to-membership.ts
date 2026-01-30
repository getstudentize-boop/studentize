import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from web app's .env.local
const envPath = resolve(__dirname, "../../../apps/web/.env.local");
config({ path: envPath });

import { db, schema, eq, sql } from "../src";

type UserType = "ADMIN" | "ADVISOR" | "STUDENT";
type MembershipRole = "OWNER" | "ADMIN" | "ADVISOR" | "STUDENT";

// Map old user types to new membership roles
const userTypeToMembershipRole: Record<UserType, MembershipRole> = {
  ADMIN: "ADMIN",
  ADVISOR: "ADVISOR",
  STUDENT: "STUDENT",
};

async function migrateUserTypesToMembership() {
  const organizationId = process.argv[2];

  if (!organizationId) {
    console.error("❌ Please provide an organization ID as an argument");
    console.log(
      "Usage: tsx scripts/migrate-user-types-to-membership.ts <organization-id>"
    );
    process.exit(1);
  }

  console.log(`\n🔄 Starting migration for organization: ${organizationId}\n`);

  try {
    // Verify the organization exists
    const [org] = await db
      .select()
      .from(schema.organization)
      .where(eq(schema.organization.id, organizationId));

    if (!org) {
      console.error(`❌ Organization with ID ${organizationId} not found`);
      process.exit(1);
    }

    console.log(`✅ Found organization: ${org.name}`);

    // Check if the type column still exists by trying to select it
    let hasTypeColumn = true;
    try {
      await db.execute(sql`SELECT "type" FROM "user" LIMIT 1`);
    } catch (e) {
      hasTypeColumn = false;
      console.log(
        "⚠️  The 'type' column has been dropped from the user table."
      );
      console.log("   Will default all new memberships to STUDENT role.\n");
    }

    // Get all users
    const allUsers = await db
      .select({ id: schema.user.id, email: schema.user.email })
      .from(schema.user);
    console.log(`📊 Found ${allUsers.length} total users\n`);

    // Get existing memberships for this organization
    const existingMemberships = await db
      .select({ userId: schema.membership.userId })
      .from(schema.membership)
      .where(eq(schema.membership.organizationId, organizationId));

    const existingUserIds = new Set(existingMemberships.map((m) => m.userId));
    console.log(
      `📊 Found ${existingMemberships.length} existing memberships in this organization\n`
    );

    // Find users without membership in this organization
    const usersWithoutMembership = allUsers.filter(
      (user) => !existingUserIds.has(user.id)
    );

    if (usersWithoutMembership.length === 0) {
      console.log(
        "✅ All users already have memberships in this organization!"
      );
      return;
    }

    console.log(
      `🔄 Creating memberships for ${usersWithoutMembership.length} users...\n`
    );

    let created = 0;
    let errors = 0;

    for (const user of usersWithoutMembership) {
      try {
        let role: MembershipRole = "STUDENT"; // Default role

        if (hasTypeColumn) {
          // Get the user's type from the database using raw SQL
          const result = await db.execute(
            sql`SELECT "type" FROM "user" WHERE "id" = ${user.id}`
          );
          const rows = result.rows as { type: UserType }[];
          if (rows.length > 0 && rows[0].type) {
            role = userTypeToMembershipRole[rows[0].type] || "STUDENT";
          }
        }

        // Create the membership
        await db.insert(schema.membership).values({
          userId: user.id,
          organizationId,
          role,
        });

        console.log(
          `  ✅ Created membership for ${user.email} with role: ${role}`
        );
        created++;
      } catch (error) {
        console.error(
          `  ❌ Error creating membership for ${user.email}:`,
          error
        );
        errors++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Created: ${created} memberships`);
    console.log(`   Errors: ${errors}`);
    console.log(
      `   Skipped (already had membership): ${existingMemberships.length}`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateUserTypesToMembership()
  .then(() => {
    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
