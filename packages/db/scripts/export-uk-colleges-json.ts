import { config } from "dotenv";
import { resolve } from "path";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

// Load environment variables (not strictly needed but keeps consistency)
const envPath = resolve(__dirname, "../../../apps/web/.env.local");
config({ path: envPath });

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

// Output JSON structure (cleaned up)
interface UKCollege {
  id: string;
  universityName: string;
  location: string | null;
  tuitionFees: number | null;
  examsAccepted: string | null;
  scholarships: string | null;
  imageUrl: string | null;
  address: string | null;
  phone: string | null;
  internationalEmail: string | null;
  yearOfEstablishment: string | null;
  totalForeignStudents: number | null;
  numberOfCampuses: string | null;
  onCampusAccommodation: string | null;
  offCampusAccommodation: string | null;
  sizeOfCity: string | null;
  academicRequirements: string | null;
  studentComposition: Record<string, unknown> | null;
  historicRanking: Record<string, Array<{ rank: number; year: number }>> | null;
  about: string | null;
  website: string | null;
  studentLifeInfo: Record<string, unknown> | null;
  populationOfCity: string | null;
}

function parseJsonSafe<T>(value: string | undefined | null): T | null {
  if (!value || value.trim() === "") return null;
  try {
    // Handle double-encoded JSON (CSV sometimes escapes JSON with extra quotes)
    let parsed = value;
    // If the value starts with a quote, try parsing it first
    if (parsed.startsWith('"') && parsed.endsWith('"')) {
      parsed = JSON.parse(parsed);
    }
    return JSON.parse(parsed) as T;
  } catch {
    // Try unescaping double quotes
    try {
      const unescaped = value.replace(/""/g, '"');
      if (unescaped.startsWith('"') && unescaped.endsWith('"')) {
        return JSON.parse(JSON.parse(unescaped)) as T;
      }
      return JSON.parse(unescaped) as T;
    } catch {
      console.warn(`Failed to parse JSON: ${value.substring(0, 100)}...`);
      return null;
    }
  }
}

function parseNumber(value: string | undefined | null): number | null {
  if (!value || value.trim() === "") return null;
  const num = Number(value.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? null : num;
}

function transformRow(row: UKCollegeCSVRow): UKCollege {
  // Parse the historic_ranking JSON
  const historicRanking = parseJsonSafe<
    Record<string, Array<{ rank: number; year: number }>>
  >(row.historic_ranking);

  // Parse student_composition - it's a nested JSON with student_composition wrapper
  const studentCompositionRaw = parseJsonSafe<{
    student_composition?: Record<string, unknown>;
  }>(row.student_composition);
  const studentComposition = studentCompositionRaw?.student_composition ?? null;

  // Parse student_life_info
  const studentLifeInfo = parseJsonSafe<Record<string, unknown>>(
    row.student_life_info
  );

  return {
    id: row.id,
    universityName: row["University Name"],
    location: row.Location || null,
    tuitionFees: parseNumber(row["Tuition Fees"]),
    examsAccepted: row["Exams Accepted"] || null,
    scholarships: row.Scholarships || null,
    imageUrl: row.image_url || null,
    address: row.address || null,
    phone: row.phone || null,
    internationalEmail: row.international_email || null,
    yearOfEstablishment: row.year_of_establishment || null,
    totalForeignStudents: parseNumber(row.total_foreign_students),
    numberOfCampuses: row.number_of_campuses || null,
    onCampusAccommodation: row.on_campus_accommodation || null,
    offCampusAccommodation: row.off_campus_accommodation || null,
    sizeOfCity: row.Size_of_City || null,
    academicRequirements: row.Academic_Requirements || null,
    studentComposition,
    historicRanking,
    about: row.About || null,
    website: row.website || null,
    studentLifeInfo,
    populationOfCity: row.Population_of_City || null,
  };
}

async function main() {
  console.log("🎓 UK Colleges CSV to JSON Export");
  console.log("==================================\n");

  // Read the CSV file
  const csvPath = path.resolve(__dirname, "../uk_colleges_rows.csv");
  console.log(`Reading CSV from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
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

  // Transform all records
  const colleges: UKCollege[] = [];
  let errors = 0;

  for (const row of records) {
    try {
      const college = transformRow(row);
      colleges.push(college);
    } catch (error) {
      errors++;
      console.error(
        `  ✗ Error transforming ${row["University Name"]}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log(`Transformed ${colleges.length} colleges (${errors} errors)\n`);

  // Write to JSON file in features/college folder
  const outputPath = path.resolve(
    __dirname,
    "../../../apps/web/src/features/college/uk-colleges-data.json"
  );

  // Ensure directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(colleges, null, 2));

  console.log(`✅ Exported to: ${outputPath}`);
  console.log(`   Total colleges: ${colleges.length}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
