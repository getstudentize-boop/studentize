import { config } from "dotenv";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "../src/schema";

// Load environment variables
const envPath = resolve(__dirname, "../../../apps/web/.env.local");
config({ path: envPath });

const client = postgres(process.env.DATABASE_URL!, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(client, { schema });

async function checkImport() {
  try {
    console.log("Checking imported colleges...\n");

    // Get count
    const countResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM us_colleges_rows`
    );
    const count = Number(countResult[0]?.count || 0);
    console.log(`✅ Total colleges in database: ${count}`);

    // Get sample colleges
    const colleges = await db.execute(
      sql`SELECT id, school_name, school_city, school_state, latest_admissions_admission_rate_overall
          FROM us_colleges_rows
          ORDER BY school_name
          LIMIT 10`
    );

    console.log("\n📚 Sample colleges:");
    colleges.forEach((college: any, i: number) => {
      const admissionRate = college.latest_admissions_admission_rate_overall
        ? `${(parseFloat(college.latest_admissions_admission_rate_overall) * 100).toFixed(1)}%`
        : "N/A";
      console.log(
        `${i + 1}. ${college.school_name} (${college.school_city}, ${college.school_state}) - Admission: ${admissionRate}`
      );
    });

    await client.end();
  } catch (error) {
    console.error("Error:", error);
    await client.end();
    process.exit(1);
  }
}

checkImport();
