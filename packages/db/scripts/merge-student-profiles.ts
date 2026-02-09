import { config } from "dotenv";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql, eq } from "drizzle-orm";
import * as schema from "../src/schema";

// Load environment variables
const envPath = resolve(__dirname, "../../../apps/web/.env");
config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not found");
  process.exit(1);
}

// Create database connection
const client = postgres(process.env.DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(client, { schema });

async function mergeStudentProfiles() {
  const newUserEmail = process.argv[2];
  const oldUserEmail = process.argv[3];

  if (!newUserEmail || !oldUserEmail) {
    console.error(
      "❌ Please provide both the new and old user's email as arguments"
    );
    console.log(
      "Usage: tsx scripts/merge-student-profiles.ts <new-user-email> <old-user-email>"
    );
    console.log(
      "Example: tsx scripts/merge-student-profiles.ts dianegandhi24@gmail.com old-email@example.com"
    );
    process.exit(1);
  }

  console.log("🔄 Merging Student Profiles");
  console.log("============================\n");

  try {
    // Test database connection
    console.log("Testing database connection...");
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connected\n");

    // Find the new user (the one that just signed up)
    const [newUser] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, newUserEmail))
      .limit(1);

    if (!newUser) {
      console.error(`❌ New user with email ${newUserEmail} not found`);
      process.exit(1);
    }

    console.log(`✅ Found new user: ${newUser.email} (ID: ${newUser.id})`);

    // Get the new user's student record
    const [newStudent] = await db
      .select()
      .from(schema.student)
      .where(eq(schema.student.userId, newUser.id))
      .limit(1);

    if (!newStudent) {
      console.error(`❌ Student record not found for new user ${newUserEmail}`);
      process.exit(1);
    }

    console.log(`✅ Found new student record (ID: ${newStudent.id})`);

    // Find the old user (the one with all sessions)
    const [oldUser] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, oldUserEmail))
      .limit(1);

    if (!oldUser) {
      console.error(`❌ Old user with email ${oldUserEmail} not found`);
      process.exit(1);
    }

    console.log(`✅ Found old user: ${oldUser.email} (ID: ${oldUser.id})`);

    if (oldUser.id === newUser.id) {
      console.error("❌ Both users are the same! Cannot merge.");
      process.exit(1);
    }

    // Get the old user's student record
    const [oldStudent] = await db
      .select()
      .from(schema.student)
      .where(eq(schema.student.userId, oldUser.id))
      .limit(1);

    if (!oldStudent) {
      console.error(`❌ Student record not found for old user`);
      process.exit(1);
    }

    console.log(`✅ Found old student record (ID: ${oldStudent.id})\n`);

    // Store the new user's email before deletion
    const newUserEmailToUse = newUser.email;

    // Step 1: Delete the new user and student record first (to free up the email)
    console.log("Step 1: Deleting new user record (to free up email)...");
    await db
      .delete(schema.student)
      .where(eq(schema.student.userId, newUser.id));
    console.log(`   ✅ Deleted new student record`);

    await db.delete(schema.user).where(eq(schema.user.id, newUser.id));
    console.log(`   ✅ Deleted new user record`);

    // Step 2: Update old user's email to new user's email
    console.log("\nStep 2: Updating old user's email...");
    await db
      .update(schema.user)
      .set({ email: newUserEmailToUse })
      .where(eq(schema.user.id, oldUser.id));
    console.log(`   ✅ Updated email: ${oldUser.email} → ${newUserEmailToUse}`);

    // Step 3: Update old student record with onboarding data from new student
    console.log(
      "\nStep 3: Updating old student record with onboarding data..."
    );
    const updateData: Partial<typeof schema.student.$inferInsert> = {};

    // Only update fields that are present in new student and not already set in old student
    if (newStudent.phone && !oldStudent.phone) {
      updateData.phone = newStudent.phone;
    }
    if (newStudent.location && !oldStudent.location) {
      updateData.location = newStudent.location;
    }
    if (
      newStudent.expectedGraduationYear &&
      !oldStudent.expectedGraduationYear
    ) {
      updateData.expectedGraduationYear = newStudent.expectedGraduationYear;
    }
    if (
      newStudent.targetCountries &&
      Array.isArray(newStudent.targetCountries) &&
      newStudent.targetCountries.length > 0 &&
      (!oldStudent.targetCountries ||
        !Array.isArray(oldStudent.targetCountries) ||
        oldStudent.targetCountries.length === 0)
    ) {
      updateData.targetCountries = newStudent.targetCountries;
    }
    if (
      newStudent.areasOfInterest &&
      Array.isArray(newStudent.areasOfInterest) &&
      newStudent.areasOfInterest.length > 0 &&
      (!oldStudent.areasOfInterest ||
        !Array.isArray(oldStudent.areasOfInterest) ||
        oldStudent.areasOfInterest.length === 0)
    ) {
      updateData.areasOfInterest = newStudent.areasOfInterest;
    }
    if (
      newStudent.supportAreas &&
      Array.isArray(newStudent.supportAreas) &&
      newStudent.supportAreas.length > 0 &&
      (!oldStudent.supportAreas ||
        !Array.isArray(oldStudent.supportAreas) ||
        oldStudent.supportAreas.length === 0)
    ) {
      updateData.supportAreas = newStudent.supportAreas;
    }
    if (newStudent.referralSource && !oldStudent.referralSource) {
      updateData.referralSource = newStudent.referralSource;
    }
    // Always update onboardingCompleted if new student has completed it
    if (newStudent.onboardingCompleted) {
      updateData.onboardingCompleted = true;
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(schema.student)
        .set(updateData)
        .where(eq(schema.student.userId, oldUser.id));
      console.log(
        `   ✅ Updated fields: ${Object.keys(updateData).join(", ")}`
      );
    } else {
      console.log(
        "   ℹ️  No new data to merge (old student already has all data)"
      );
    }

    console.log("\n============================");
    console.log("✅ Merge complete!");
    console.log(`\nSummary:`);
    console.log(`   Old user ID: ${oldUser.id}`);
    console.log(`   New email: ${newUserEmailToUse}`);
    console.log(
      `   Onboarding data merged: ${Object.keys(updateData).length > 0 ? "Yes" : "No"}`
    );
    console.log(`\nThe old user now has:`);
    console.log(`   - Email: ${newUserEmailToUse}`);
    console.log(`   - Updated onboarding information`);
  } catch (error) {
    console.error("\n❌ Error during merge:", error);
    throw error;
  }
}

mergeStudentProfiles()
  .then(async () => {
    await client.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Script failed:", error);
    await client.end();
    process.exit(1);
  });
