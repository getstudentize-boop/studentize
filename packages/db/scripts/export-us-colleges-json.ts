import { config } from "dotenv";
import { resolve } from "path";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

// Load environment variables
const envPath = resolve(__dirname, "../../../apps/web/.env.local");
config({ path: envPath });

// CSV row interface matching the CSV headers
interface USCollegeCSVRow {
  id: string;
  school_name: string;
  school_city: string;
  school_state: string;
  latest_admissions_admission_rate_overall: string;
  latest_cost_tuition_out_of_state: string;
  latest_admissions_sat_scores_average_overall: string;
  latest_student_size: string;
  image_url: string;
  address: string;
  phone: string;
  international_email: string;
  year_of_establishment: string;
  total_foreign_students: string;
  no_of_campus: string;
  overall_graduation_rate: string;
  ug_race_json: string;
  ug_student_residence_json: string;
  ug_age_distribution_json: string;
  graduation_rate: string;
  post_grad_earnings: string;
  median_family_income: string;
  retention_rate: string;
  share_first_generation: string;
  plus_loan_debt_median: string;
  pell_grant_rate: string;
  federal_loan_rate: string;
  avg_family_income: string;
  act_score_midpoint: string;
  total_enrollment: string;
  undergraduate_enrollment: string;
  graduate_enrollment: string;
  female_share: string;
  male_share: string;
  median_debt: string;
  website: string;
  campus_setting: string;
  services_data: string;
  admissions_factors: string;
  application_deadlines: string;
  application_requirements: string;
  about_section: string;
  essay_prompts: string;
  math_sat_range: string;
  reading_sat_range: string;
  sat_acceptance_chances: string;
  greek_life: string;
  environment: string;
  political_and_social_climate: string;
  cost_of_living: string;
  safety_and_crime: string;
  health_and_wellbeing: string;
  gym_and_health: string;
}

function parseJsonSafe<T>(value: string | undefined | null): T | null {
  if (!value || value.trim() === "" || value.trim() === "null") return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    try {
      // Try unescaping double quotes
      const unescaped = value.replace(/""/g, '"');
      return JSON.parse(unescaped) as T;
    } catch {
      return null;
    }
  }
}

function parseNumber(value: string | undefined | null): number | null {
  if (!value || value.trim() === "" || value.trim() === "null") return null;
  const num = Number(value.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? null : num;
}

function transformRow(row: USCollegeCSVRow) {
  return {
    id: row.id,
    schoolName: row.school_name,
    schoolCity: row.school_city || null,
    schoolState: row.school_state || null,
    admissionRate: parseNumber(row.latest_admissions_admission_rate_overall),
    tuitionOutOfState: parseNumber(row.latest_cost_tuition_out_of_state),
    satScoreAverage: parseNumber(row.latest_admissions_sat_scores_average_overall),
    studentSize: parseNumber(row.latest_student_size),
    imageUrl: row.image_url || null,
    address: row.address || null,
    phone: row.phone || null,
    internationalEmail: row.international_email || null,
    yearOfEstablishment: row.year_of_establishment || null,
    totalForeignStudents: parseNumber(row.total_foreign_students),
    noOfCampus: row.no_of_campus || null,
    overallGraduationRate: row.overall_graduation_rate || null,
    ugRaceJson: parseJsonSafe<Record<string, string>>(row.ug_race_json),
    ugStudentResidenceJson: parseJsonSafe<Record<string, string>>(row.ug_student_residence_json),
    ugAgeDistributionJson: parseJsonSafe<Record<string, string>>(row.ug_age_distribution_json),
    graduationRate: parseNumber(row.graduation_rate),
    postGradEarnings: parseNumber(row.post_grad_earnings),
    medianFamilyIncome: parseNumber(row.median_family_income),
    retentionRate: parseNumber(row.retention_rate),
    shareFirstGeneration: parseNumber(row.share_first_generation),
    plusLoanDebtMedian: parseNumber(row.plus_loan_debt_median),
    pellGrantRate: parseNumber(row.pell_grant_rate),
    federalLoanRate: parseNumber(row.federal_loan_rate),
    avgFamilyIncome: parseNumber(row.avg_family_income),
    actScoreMidpoint: parseNumber(row.act_score_midpoint),
    totalEnrollment: parseNumber(row.total_enrollment),
    undergraduateEnrollment: parseNumber(row.undergraduate_enrollment),
    graduateEnrollment: parseNumber(row.graduate_enrollment),
    femaleShare: parseNumber(row.female_share),
    maleShare: parseNumber(row.male_share),
    medianDebt: parseNumber(row.median_debt),
    website: row.website || null,
    campusSetting: row.campus_setting || null,
    servicesData: parseJsonSafe<{
      campus_security?: string[];
      student_services?: string[];
    }>(row.services_data),
    admissionsFactors: parseJsonSafe<Record<string, string>>(row.admissions_factors),
    applicationDeadlines: parseJsonSafe<unknown>(row.application_deadlines),
    applicationRequirements: parseJsonSafe<Array<{
      Area?: string;
      Details?: string;
      Required?: string;
      Recommended?: string;
      "Required for Some"?: string;
    }>>(row.application_requirements),
    aboutSection: row.about_section || null,
    essayPrompts: parseJsonSafe<unknown>(row.essay_prompts),
    mathSatRange: row.math_sat_range || null,
    readingSatRange: row.reading_sat_range || null,
    satAcceptanceChances: parseJsonSafe<{
      title?: string;
      ranges?: Array<{
        chance?: string;
        score_text?: string;
        chance_level?: string;
      }>;
      headers?: {
        column1?: string;
        column2?: string;
      };
    }>(row.sat_acceptance_chances),
    greekLife: row.greek_life || null,
    environment: row.environment || null,
    politicalAndSocialClimate: row.political_and_social_climate || null,
    costOfLiving: row.cost_of_living || null,
    safetyAndCrime: row.safety_and_crime || null,
    healthAndWellbeing: row.health_and_wellbeing || null,
    gymAndHealth: row.gym_and_health || null,
  };
}

async function main() {
  console.log("🎓 US Colleges CSV to JSON Export");
  console.log("==================================\n");

  // Read the CSV file
  const csvPath = path.resolve(__dirname, "../us_colleges_rows.csv");
  console.log(`Reading CSV from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");

  // Parse CSV
  const records: USCollegeCSVRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  console.log(`Found ${records.length} colleges in CSV\n`);

  // Transform all records
  const colleges: ReturnType<typeof transformRow>[] = [];
  let errors = 0;

  for (const row of records) {
    try {
      const college = transformRow(row);
      colleges.push(college);
    } catch (error) {
      errors++;
      console.error(
        `  ✗ Error transforming ${row.school_name}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log(`Transformed ${colleges.length} colleges (${errors} errors)\n`);

  // Write to JSON file in features/college folder
  const outputPath = path.resolve(
    __dirname,
    "../../../apps/web/src/features/college/us-colleges-data.json"
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
