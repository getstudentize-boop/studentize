import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from web app's .env.local
const envPath = resolve(__dirname, "../../../apps/web/.env.local");
config({ path: envPath });

import { createId, db, findOrCreateUser, schema } from "../src";

async function createOrganization() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Please provide a user email as an argument");
    console.log("Usage: tsx scripts/create-organization.ts <user-email>");
    process.exit(1);
  }

  console.log(`Creating organization for email: ${email}`);

  try {
    // Generate a name from the email
    const baseName = email.split("@")[0];
    const orgName = `${baseName}'s Organization`;

    // Create the organization first
    const [organization] = await db
      .insert(schema.organization)
      .values({
        name: orgName,
        status: "PENDING",
      })
      .returning();

    console.log(
      `✅ Created organization: ${organization.name} (ID: ${organization.id})`
    );

    // Find or create the user with the organization ID
    const user = await findOrCreateUser({
      email,
      organizationId: organization.id,
    });

    console.log(`✅ Found/created user: ${user.email} (ID: ${user.id})`);

    // Create the membership with OWNER role
    const [membership] = await db
      .insert(schema.membership)
      .values({
        userId: user.id,
        organizationId: organization.id,
        role: "OWNER",
      })
      .returning();

    console.log(`✅ Created membership with role: ${membership.role}`);
    console.log("\n🎉 Success! Organization and membership created:");
    console.log(
      `   Organization: ${organization.name} (ID: ${organization.id})`
    );
    console.log(`   User: ${user.email}`);
    console.log(`   Role: ${membership.role}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createOrganization()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
