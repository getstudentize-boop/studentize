import { config } from "dotenv";
import { resolve } from "path";
import { db } from "../src";

// Load environment variables from web app's .env.local
const envPath = resolve(__dirname, "../../../apps/web/.env.local");
console.log(`Loading environment from: ${envPath}`);
config({ path: envPath });

async function testConnection() {
  console.log("Testing database connection...");
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 30)}...`);

  try {
    // Test with a simple select query using drizzle's sql helper
    const { sql } = await import("drizzle-orm");
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    console.log("✅ Connection successful!");
    console.log("Result:", result);

    // Try to count existing colleges
    const countResult = await db.execute(sql`SELECT COUNT(*) as college_count FROM us_colleges_rows`);
    console.log("Existing colleges:", countResult);
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  }
}

testConnection()
  .then(() => {
    console.log("Test completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
