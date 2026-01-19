import { config } from "dotenv";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/schema";

// Load environment variables from web app's .env.local
const envPath = resolve(__dirname, "../../../apps/web/.env.local");
console.log(`Loading environment from: ${envPath}`);
config({ path: envPath });

// Create a dedicated connection for this script with proper configuration
const client = postgres(process.env.DATABASE_URL!, {
  max: 1, // Use only 1 connection
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Disable prepared statements for better compatibility
});

const db = drizzle(client, { schema });

// Verify required environment variables
if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set");
  console.error("Please ensure DATABASE_URL is in apps/web/.env.local");
  process.exit(1);
}

if (!process.env.COLLEGE_SCORECARD_API_KEY) {
  console.error("ERROR: COLLEGE_SCORECARD_API_KEY environment variable is not set");
  process.exit(1);
}

const COLLEGE_SCORECARD_API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;
const BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";

interface CollegeScorecardSchool {
  id: number;
  "school.name": string;
  "school.city": string;
  "school.state": string;
  "school.school_url": string;
  "school.locale": number;
  "latest.admissions.admission_rate.overall": number;
  "latest.cost.tuition.out_of_state": number;
  "latest.admissions.sat_scores.average.overall": number;
  "latest.student.size": number;
  "latest.student.enrollment.all": number;
  "latest.student.enrollment.undergrad": number;
  "latest.student.enrollment.grad": number;
  "latest.student.demographics.female_share": number;
  "latest.student.demographics.male": number;
  "latest.student.retention_rate.four_year.full_time": number;
  "latest.student.share_firstgeneration": number;
  "latest.completion.completion_rate_4yr_100nt": number;
  "latest.earnings.10_yrs_after_entry.median": number;
  "latest.student.demographics.median_family_income": number;
  "latest.aid.pell_grant_rate": number;
  "latest.aid.federal_loan_rate": number;
  "latest.aid.median_debt.completers.overall": number;
  "latest.aid.median_debt.completers.monthly_payments": number;
  "latest.student.demographics.race_ethnicity.white": number;
  "latest.student.demographics.race_ethnicity.black": number;
  "latest.student.demographics.race_ethnicity.hispanic": number;
  "latest.student.demographics.race_ethnicity.asian": number;
  "latest.student.demographics.age_entry": number;
  "latest.student.share_independent_students": number;
  "school.degrees_awarded.predominant": number;
  "school.institutional_characteristics.level": number;
}

// Field mapping for API request
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
  "latest.student.demographics.age_entry",
  "latest.student.share_independent_students",
  "school.degrees_awarded.predominant",
  "school.institutional_characteristics.level",
].join(",");

function mapLocaleToCampusSetting(locale: number): string {
  // College Scorecard locale codes:
  // 11-13: City (Large, Midsize, Small)
  // 21-23: Suburb (Large, Midsize, Small)
  // 31-33: Town (Fringe, Distant, Remote)
  // 41-43: Rural (Fringe, Distant, Remote)

  if (locale >= 11 && locale <= 13) return "City";
  if (locale >= 21 && locale <= 23) return "Suburban";
  if (locale >= 31 && locale <= 33) return "Town";
  if (locale >= 41 && locale <= 43) return "Rural";
  return "Unknown";
}

async function fetchColleges(page: number = 0, perPage: number = 100) {
  const url = new URL(BASE_URL);
  url.searchParams.set("api_key", COLLEGE_SCORECARD_API_KEY);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("per_page", perPage.toString());

  // Filter for quality institutions
  url.searchParams.set("school.degrees_awarded.predominant", "3"); // Bachelor's degree
  url.searchParams.set("latest.student.size__range", "100.."); // At least 100 students
  url.searchParams.set("school.operating", "1"); // Currently operating

  console.log(`Fetching page ${page}...`);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results as CollegeScorecardSchool[];
}

function transformToDbSchema(school: CollegeScorecardSchool): typeof schema.usCollege.$inferInsert {
  return {
    id: school.id.toString(),
    schoolName: school["school.name"],
    schoolCity: school["school.city"] || null,
    schoolState: school["school.state"] || null,
    admissionRate: school["latest.admissions.admission_rate.overall"]?.toString() || null,
    tuitionOutOfState: school["latest.cost.tuition.out_of_state"]?.toString() || null,
    satScoreAverage: school["latest.admissions.sat_scores.average.overall"] || null,
    studentSize: school["latest.student.size"]?.toString() || null,
    totalEnrollment: school["latest.student.enrollment.all"]?.toString() || null,
    undergraduateEnrollment: school["latest.student.enrollment.undergrad"]?.toString() || null,
    graduateEnrollment: school["latest.student.enrollment.grad"] || null,
    femaleShare: school["latest.student.demographics.female_share"]?.toString() || null,
    maleShare: school["latest.student.demographics.male"]?.toString() || null,
    retentionRate: school["latest.student.retention_rate.four_year.full_time"]?.toString() || null,
    shareFirstGeneration: school["latest.student.share_firstgeneration"]?.toString() || null,
    overallGraduationRate: school["latest.completion.completion_rate_4yr_100nt"]?.toString() || null,
    graduationRate: school["latest.completion.completion_rate_4yr_100nt"]?.toString() || null,
    postGradEarnings: school["latest.earnings.10_yrs_after_entry.median"]?.toString() || null,
    medianFamilyIncome: school["latest.student.demographics.median_family_income"]?.toString() || null,
    avgFamilyIncome: school["latest.student.demographics.median_family_income"]?.toString() || null,
    pellGrantRate: school["latest.aid.pell_grant_rate"]?.toString() || null,
    federalLoanRate: school["latest.aid.federal_loan_rate"]?.toString() || null,
    medianDebt: school["latest.aid.median_debt.completers.overall"]?.toString() || null,
    plusLoanDebtMedian: school["latest.aid.median_debt.completers.monthly_payments"]
      ? Math.round(school["latest.aid.median_debt.completers.monthly_payments"])
      : null,
    website: school["school.school_url"] || null,
    campusSetting: school["school.locale"] ? mapLocaleToCampusSetting(school["school.locale"]) : null,

    // Demographics JSON
    ugRaceJson: {
      Asian: school["latest.student.demographics.race_ethnicity.asian"]?.toString(),
      Black: school["latest.student.demographics.race_ethnicity.black"]?.toString(),
      Hispanic: school["latest.student.demographics.race_ethnicity.hispanic"]?.toString(),
      Others: (1 -
        (school["latest.student.demographics.race_ethnicity.asian"] || 0) -
        (school["latest.student.demographics.race_ethnicity.black"] || 0) -
        (school["latest.student.demographics.race_ethnicity.hispanic"] || 0)
      )?.toString(),
    },

    // Placeholder fields (not available from College Scorecard API)
    imageUrl: null,
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

async function main() {
  console.log("Starting College Scorecard data import...");
  console.log(`Using API key: ${COLLEGE_SCORECARD_API_KEY.substring(0, 8)}...`);

  // Test database connection first
  try {
    console.log("Testing database connection...");
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`SELECT 1`);
    console.log("Database connection successful!");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    await client.end();
    process.exit(1);
  }

  const TARGET_COUNT = 600;
  const PER_PAGE = 100;
  const BATCH_SIZE = 10; // Insert in batches of 10
  const pages = Math.ceil(TARGET_COUNT / PER_PAGE);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (let page = 0; page < pages; page++) {
    try {
      const schools = await fetchColleges(page, PER_PAGE);

      console.log(`Fetched ${schools.length} schools from page ${page}`);

      if (schools.length === 0) {
        console.log("No more schools to fetch");
        break;
      }

      // Process schools in batches
      for (let i = 0; i < schools.length; i += BATCH_SIZE) {
        const batch = schools.slice(i, i + BATCH_SIZE);
        const dbSchools = batch.map(transformToDbSchema);

        try {
          // Insert batch
          for (const dbSchool of dbSchools) {
            try {
              const { id, ...updateFields } = dbSchool;

              await db
                .insert(schema.usCollege)
                .values(dbSchool)
                .onConflictDoUpdate({
                  target: schema.usCollege.id,
                  set: updateFields,
                });

              totalInserted++;
            } catch (error) {
              const schoolName = batch[dbSchools.indexOf(dbSchool)]?.["school.name"] || "Unknown";
              console.error(`Error inserting ${schoolName}:`, error instanceof Error ? error.message : error);
              totalSkipped++;
            }
          }

          if (totalInserted % 50 === 0) {
            console.log(`Progress: ${totalInserted} schools processed`);
          }

          // Small delay between batches to avoid overwhelming the connection
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error processing batch:`, error);
          totalSkipped += batch.length;
        }
      }

      // Rate limiting - wait between pages
      if (page < pages - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Stop if we've reached our target
      if (totalInserted >= TARGET_COUNT) {
        console.log(`Reached target of ${TARGET_COUNT} schools`);
        break;
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      break;
    }
  }

  console.log("\n=== Import Complete ===");
  console.log(`Total schools inserted/updated: ${totalInserted}`);
  console.log(`Total schools skipped: ${totalSkipped}`);
}

main()
  .then(async () => {
    console.log("Script completed successfully");
    await client.end(); // Close the connection
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Script failed:", error);
    await client.end(); // Close the connection
    process.exit(1);
  });
