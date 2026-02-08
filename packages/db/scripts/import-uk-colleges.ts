import { config } from "dotenv";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import * as schema from "../src/schema";

// Load environment variables
const envPath = resolve(__dirname, "../../../apps/web/.env.local");
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

// Load existing UK colleges JSON for imageUrl lookup
const ukCollegesJsonPath = path.resolve(
  __dirname,
  "../../../apps/web/src/features/college/uk-colleges-data.json"
);

interface UKCollegeJSON {
  id: string;
  imageUrl?: string | null;
}

let imageUrlLookup: Map<string, string> = new Map();

if (fs.existsSync(ukCollegesJsonPath)) {
  console.log("Loading existing UK colleges JSON for imageUrl lookup...");
  const jsonData: UKCollegeJSON[] = JSON.parse(
    fs.readFileSync(ukCollegesJsonPath, "utf-8")
  );
  imageUrlLookup = new Map(
    jsonData
      .filter((college) => college.imageUrl)
      .map((college) => [college.id, college.imageUrl!])
  );
  console.log(`Loaded ${imageUrlLookup.size} image URLs from JSON\n`);
}

// CSV row interface matching the CSV headers
interface UKCollegeCSVRow {
  id: string;
  "University Name": string;
  Location: string;
  "Tuition Fees": string;
  "Exams Accepted": string;
  Scholarships: string;
  image_url: string;
  address: string;
  phone: string;
  international_email: string;
  year_of_establishment: string;
  total_foreign_students: string;
  number_of_campuses: string;
  on_campus_accommodation: string;
  off_campus_accommodation: string;
  Size_of_City: string;
  Academic_Requirements: string;
  student_composition: string;
  historic_ranking: string;
  About: string;
  website: string;
  student_life_info: string;
  Population_of_City: string;
}

function parseJsonSafe<T>(value: string | undefined | null): T | null {
  // Handle null, undefined, or empty strings
  if (!value || value.trim() === "" || value.trim() === '""' || value.trim() === "''") {
    return null;
  }
  
  const trimmed = value.trim();
  
  try {
    // Handle double-encoded JSON (CSV sometimes escapes JSON with extra quotes)
    let parsed = trimmed;
    // If the value starts with a quote, try parsing it first
    if (parsed.startsWith('"') && parsed.endsWith('"')) {
      parsed = JSON.parse(parsed);
    }
    return JSON.parse(parsed) as T;
  } catch {
    // Try unescaping double quotes
    try {
      const unescaped = trimmed.replace(/""/g, '"');
      // Skip if unescaped is still empty or just quotes
      if (unescaped.trim() === "" || unescaped.trim() === '""' || unescaped.trim() === "''") {
        return null;
      }
      if (unescaped.startsWith('"') && unescaped.endsWith('"')) {
        return JSON.parse(JSON.parse(unescaped)) as T;
      }
      return JSON.parse(unescaped) as T;
    } catch {
      // Only warn if the value looks like it might be JSON (contains { or [)
      if (trimmed.includes("{") || trimmed.includes("[")) {
        console.warn(`Failed to parse JSON: ${trimmed.substring(0, 100)}...`);
      }
      return null;
    }
  }
}

function transformToDbSchema(
  row: UKCollegeCSVRow
): typeof schema.ukCollege.$inferInsert {
  // Parse the historic_ranking JSON
  const historicRanking = parseJsonSafe<
    Record<string, Array<{ rank: number; year: number }>>
  >(row.historic_ranking);

  // Parse student_composition - it's a nested JSON with student_composition wrapper
  const studentCompositionRaw = parseJsonSafe<{
    student_composition?: object;
  }>(row.student_composition);
  const studentComposition = studentCompositionRaw?.student_composition
    ? JSON.stringify(studentCompositionRaw.student_composition)
    : row.student_composition || null;

  // Parse student_life_info - it's a nested JSON
  const studentLifeInfo = parseJsonSafe<object>(row.student_life_info);

  // Prefer imageUrl from JSON lookup, fallback to CSV value
  const imageUrl = imageUrlLookup.get(row.id) || row.image_url || null;

  return {
    id: row.id,
    universityName: row["University Name"],
    location: row.Location || null,
    tuitionFees: row["Tuition Fees"] || null,
    examsAccepted: row["Exams Accepted"] || null,
    scholarships: row.Scholarships || null,
    imageUrl,
    address: row.address || null,
    phone: row.phone || null,
    internationalEmail: row.international_email || null,
    yearOfEstablishment: row.year_of_establishment || null,
    totalForeignStudents: row.total_foreign_students || null,
    numberOfCampuses: row.number_of_campuses || null,
    onCampusAccommodation: row.on_campus_accommodation || null,
    offCampusAccommodation: row.off_campus_accommodation || null,
    sizeOfCity: row.Size_of_City || null,
    academicRequirements: row.Academic_Requirements || null,
    studentComposition: studentComposition,
    historicRanking: historicRanking,
    about: row.About || null,
    website: row.website || null,
    studentLifeInfo: studentLifeInfo ? JSON.stringify(studentLifeInfo) : null,
    populationOfCity: row.Population_of_City || null,
  };
}

async function main() {
  console.log("🎓 UK Colleges CSV Import");
  console.log("============================\n");

  // Test database connection
  console.log("Testing database connection...");
  try {
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connected\n");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    await client.end();
    process.exit(1);
  }

  // Read the CSV file
  const csvPath = path.resolve(__dirname, "../uk_colleges_rows.csv");
  console.log(`Reading CSV from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    await client.end();
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");

  // Parse CSV
  const records: UKCollegeCSVRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  console.log(`Found ${records.length} colleges in CSV\n`);

  let totalImported = 0;
  let totalErrors = 0;
  let totalUpdated = 0;

  // Import each college
  for (const row of records) {
    try {
      const dbCollege = transformToDbSchema(row);
      const { id, ...updateFields } = dbCollege;

      // Check if record exists
      const existing = await db
        .select({ id: schema.ukCollege.id })
        .from(schema.ukCollege)
        .where(sql`${schema.ukCollege.id} = ${id}`)
        .limit(1);

      if (existing.length > 0) {
        // Update existing record
        await db
          .update(schema.ukCollege)
          .set(updateFields)
          .where(sql`${schema.ukCollege.id} = ${id}`);
        totalUpdated++;
      } else {
        // Insert new record
        await db.insert(schema.ukCollege).values(dbCollege);
        totalImported++;
      }

      if ((totalImported + totalUpdated) % 10 === 0) {
        console.log(
          `  ✓ Processed ${totalImported + totalUpdated} colleges (${totalImported} new, ${totalUpdated} updated)...`
        );
      }
    } catch (error) {
      totalErrors++;
      console.error(
        `  ✗ Error importing ${row["University Name"]}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log("\n============================");
  console.log(`✅ Import complete!`);
  console.log(`   New records: ${totalImported}`);
  console.log(`   Updated records: ${totalUpdated}`);
  console.log(`   Errors: ${totalErrors}`);

  await client.end();
}

main().catch(async (error) => {
  console.error("Fatal error:", error);
  await client.end();
  process.exit(1);
});
