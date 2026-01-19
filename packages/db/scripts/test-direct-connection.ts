import { config } from "dotenv";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Load environment variables
const envPath = resolve(__dirname, "../../../apps/web/.env.local");
console.log(`Loading environment from: ${envPath}`);
config({ path: envPath });

// Try direct connection instead of pooler
const poolerUrl = process.env.DATABASE_URL!;
const directUrl = poolerUrl.replace(
  ".pooler.supabase.com:6543",
  ".supabase.co:5432"
);

console.log("Pooler URL:", poolerUrl.substring(0, 50) + "...");
console.log("Direct URL:", directUrl.substring(0, 50) + "...");

async function testConnections() {
  // Test direct connection
  console.log("\n=== Testing DIRECT connection ===");
  const directClient = postgres(directUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

  const directDb = drizzle(directClient);

  try {
    const { sql } = await import("drizzle-orm");
    const result = await directDb.execute(sql`SELECT NOW() as current_time, version() as pg_version`);
    console.log("✅ Direct connection successful!");
    console.log("Result:", result);
    await directClient.end();
  } catch (error) {
    console.error("❌ Direct connection failed:", error);
    await directClient.end();
    process.exit(1);
  }
}

testConnections()
  .then(() => {
    console.log("\nTest completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nTest failed:", error);
    process.exit(1);
  });
