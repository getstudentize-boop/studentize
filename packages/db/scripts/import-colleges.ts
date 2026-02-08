import { config } from "dotenv";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import * as schema from "../src/schema";

// Load environment variables
const envPath = resolve(__dirname, "../../../apps/web/.env.local");
config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not found");
  process.exit(1);
}

if (!process.env.COLLEGE_SCORECARD_API_KEY) {
  console.error("ERROR: COLLEGE_SCORECARD_API_KEY not found");
  process.exit(1);
}

const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;
const BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";

// Create database connection
const client = postgres(process.env.DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(client, { schema });

// Load existing US colleges JSON for imageUrl lookup
const usCollegesJsonPath = path.resolve(
  __dirname,
  "../../../apps/web/src/features/college/us-colleges-data.json"
);

interface USCollegeJSON {
  id: string;
  imageUrl?: string | null;
}

let imageUrlLookup: Map<string, string> = new Map();

if (fs.existsSync(usCollegesJsonPath)) {
  console.log("Loading existing US colleges JSON for imageUrl lookup...");
  const jsonData: USCollegeJSON[] = JSON.parse(
    fs.readFileSync(usCollegesJsonPath, "utf-8")
  );
  imageUrlLookup = new Map(
    jsonData
      .filter((college) => college.imageUrl)
      .map((college) => [college.id, college.imageUrl!])
  );
  console.log(`Loaded ${imageUrlLookup.size} image URLs from JSON\n`);
}

interface CollegeData {
  id: number;
  "school.name": string;
  "school.city": string | null;
  "school.state": string | null;
  "school.school_url": string | null;
  "school.locale": number | null;
  "latest.admissions.admission_rate.overall": number | null;
  "latest.cost.tuition.out_of_state": number | null;
  "latest.admissions.sat_scores.average.overall": number | null;
  "latest.student.size": number | null;
  "latest.student.enrollment.all": number | null;
  "latest.student.enrollment.undergrad": number | null;
  "latest.student.enrollment.grad": number | null;
  "latest.student.demographics.female_share": number | null;
  "latest.student.demographics.male": number | null;
  "latest.student.retention_rate.four_year.full_time": number | null;
  "latest.student.share_firstgeneration": number | null;
  "latest.completion.completion_rate_4yr_100nt": number | null;
  "latest.earnings.10_yrs_after_entry.median": number | null;
  "latest.student.demographics.median_family_income": number | null;
  "latest.aid.pell_grant_rate": number | null;
  "latest.aid.federal_loan_rate": number | null;
  "latest.aid.median_debt.completers.overall": number | null;
  "latest.aid.median_debt.completers.monthly_payments": number | null;
  "latest.student.demographics.race_ethnicity.white": number | null;
  "latest.student.demographics.race_ethnicity.black": number | null;
  "latest.student.demographics.race_ethnicity.hispanic": number | null;
  "latest.student.demographics.race_ethnicity.asian": number | null;
}

const FIELDS = [
  "id",
  "school.name",
  "school.city",
  "school.state",
  "school.school_url",
  "school.locale",
  "latest.admissions.admission_rate.overall",
  "latest.cost.tuition.out_of_state",
  "latest.admissions.sat_scores.average.overall",
  "latest.student.size",
  "latest.student.enrollment.all",
  "latest.student.enrollment.undergrad",
  "latest.student.enrollment.grad",
  "latest.student.demographics.female_share",
  "latest.student.demographics.male",
  "latest.student.retention_rate.four_year.full_time",
  "latest.student.share_firstgeneration",
  "latest.completion.completion_rate_4yr_100nt",
  "latest.earnings.10_yrs_after_entry.median",
  "latest.student.demographics.median_family_income",
  "latest.aid.pell_grant_rate",
  "latest.aid.federal_loan_rate",
  "latest.aid.median_debt.completers.overall",
  "latest.aid.median_debt.completers.monthly_payments",
  "latest.student.demographics.race_ethnicity.white",
  "latest.student.demographics.race_ethnicity.black",
  "latest.student.demographics.race_ethnicity.hispanic",
  "latest.student.demographics.race_ethnicity.asian",
].join(",");

function mapLocaleToCampusSetting(locale: number): string {
  if (locale >= 11 && locale <= 13) return "City";
  if (locale >= 21 && locale <= 23) return "Suburban";
  if (locale >= 31 && locale <= 33) return "Town";
  if (locale >= 41 && locale <= 43) return "Rural";
  return "Unknown";
}

function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function generateLogoUrl(websiteUrl: string | null): string | null {
  const domain = extractDomain(websiteUrl);
  if (!domain) return null;
  // Use Clearbit Logo API - free service that fetches company/organization logos
  return `https://logo.clearbit.com/${domain}`;
}

function transformToDbSchema(college: CollegeData): typeof schema.usCollege.$inferInsert {
  const websiteUrl = college["school.school_url"] || null;
  const collegeId = college.id.toString();

  // Prefer imageUrl from JSON lookup, fallback to Clearbit-generated URL
  const imageUrl = imageUrlLookup.get(collegeId) || generateLogoUrl(websiteUrl);

  return {
    id: collegeId,
    schoolName: college["school.name"],
    schoolCity: college["school.city"] || null,
    schoolState: college["school.state"] || null,
    admissionRate: college["latest.admissions.admission_rate.overall"]?.toString() || null,
    tuitionOutOfState: college["latest.cost.tuition.out_of_state"]?.toString() || null,
    satScoreAverage: college["latest.admissions.sat_scores.average.overall"] || null,
    studentSize: college["latest.student.size"]?.toString() || null,
    totalEnrollment: college["latest.student.enrollment.all"]?.toString() || null,
    undergraduateEnrollment: college["latest.student.enrollment.undergrad"]?.toString() || null,
    graduateEnrollment: college["latest.student.enrollment.grad"] || null,
    femaleShare: college["latest.student.demographics.female_share"]?.toString() || null,
    maleShare: college["latest.student.demographics.male"]?.toString() || null,
    retentionRate: college["latest.student.retention_rate.four_year.full_time"]?.toString() || null,
    shareFirstGeneration: college["latest.student.share_firstgeneration"]?.toString() || null,
    overallGraduationRate: college["latest.completion.completion_rate_4yr_100nt"]?.toString() || null,
    graduationRate: college["latest.completion.completion_rate_4yr_100nt"]?.toString() || null,
    postGradEarnings: college["latest.earnings.10_yrs_after_entry.median"]?.toString() || null,
    medianFamilyIncome: college["latest.student.demographics.median_family_income"]?.toString() || null,
    avgFamilyIncome: college["latest.student.demographics.median_family_income"]?.toString() || null,
    pellGrantRate: college["latest.aid.pell_grant_rate"]?.toString() || null,
    federalLoanRate: college["latest.aid.federal_loan_rate"]?.toString() || null,
    medianDebt: college["latest.aid.median_debt.completers.overall"]?.toString() || null,
    plusLoanDebtMedian: college["latest.aid.median_debt.completers.monthly_payments"]
      ? Math.round(college["latest.aid.median_debt.completers.monthly_payments"])
      : null,
    website: websiteUrl,
    campusSetting: college["school.locale"] ? mapLocaleToCampusSetting(college["school.locale"]) : null,
    ugRaceJson: {
      Asian: college["latest.student.demographics.race_ethnicity.asian"]?.toString(),
      Black: college["latest.student.demographics.race_ethnicity.black"]?.toString(),
      Hispanic: college["latest.student.demographics.race_ethnicity.hispanic"]?.toString(),
      White: college["latest.student.demographics.race_ethnicity.white"]?.toString(),
    },
    // Use imageUrl from JSON lookup, fallback to Clearbit-generated URL
    imageUrl,
    // Placeholder fields
    address: null,
    phone: null,
    internationalEmail: null,
    yearOfEstablishment: null,
    totalForeignStudents: null,
    noOfCampus: null,
    ugStudentResidenceJson: null,
    ugAgeDistributionJson: null,
    servicesData: null,
    admissionsFactors: null,
    applicationDeadlines: null,
    applicationRequirements: null,
    alias: null,
    aboutSection: null,
    essayPrompts: null,
    mathSatRange: null,
    readingSatRange: null,
    satAcceptanceChances: null,
    greekLife: null,
    environment: null,
    politicalAndSocialClimate: null,
    costOfLiving: null,
    safetyAndCrime: null,
    healthAndWellbeing: null,
    gymAndHealth: null,
    usNewsNationalRanking: null,
    virtualTour: null,
    actScoreMidpoint: null,
  };
}

async function fetchColleges(page: number = 0): Promise<CollegeData[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("per_page", "100");
  url.searchParams.set("school.degrees_awarded.predominant", "3");
  url.searchParams.set("school.operating", "1");
  url.searchParams.set("latest.student.size__range", "100..");

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.results || [];
}

async function main() {
  console.log("🎓 College Scorecard Import");
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

  let totalImported = 0;
  let totalErrors = 0;
  let page = 0;
  let consecutiveAPIErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 3;

  console.log("Fetching ALL bachelor's-degree-granting institutions...\n");

  while (true) {
    try {
      console.log(`Fetching page ${page}...`);
      const colleges = await fetchColleges(page);

      if (colleges.length === 0) {
        console.log("No more colleges available");
        break;
      }

      console.log(`  Retrieved ${colleges.length} colleges`);
      consecutiveAPIErrors = 0; // Reset error counter on success

      // Import each college
      for (const college of colleges) {
        try {
          const dbCollege = transformToDbSchema(college);
          const { id, ...updateFields } = dbCollege;

          await db
            .insert(schema.usCollege)
            .values(dbCollege)
            .onConflictDoUpdate({
              target: schema.usCollege.id,
              set: updateFields,
            });

          totalImported++;

          if (totalImported % 100 === 0) {
            console.log(`  ✓ Imported ${totalImported} colleges...`);
          }
        } catch (error) {
          totalErrors++;
          console.error(`  ✗ Error importing ${college["school.name"]}:`, error instanceof Error ? error.message : error);
        }
      }

      page++;
      // Delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      consecutiveAPIErrors++;
      console.error(`❌ Error fetching page ${page}:`, error);

      if (consecutiveAPIErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.log(`\n⚠️  Stopping after ${consecutiveAPIErrors} consecutive API errors`);
        break;
      }

      // Wait longer before retrying after an error
      console.log(`  Waiting 5 seconds before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      page++; // Skip the problematic page
    }
  }

  console.log("\n============================");
  console.log(`✅ Import complete!`);
  console.log(`   Imported: ${totalImported} colleges`);
  console.log(`   Errors: ${totalErrors}`);

  await client.end();
}

main().catch(async (error) => {
  console.error("Fatal error:", error);
  await client.end();
  process.exit(1);
});
