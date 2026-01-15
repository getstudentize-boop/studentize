import {
  jsonb,
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

// US Colleges Schema
export const usCollege = pgTable(
  "us_colleges_rows",
  {
    id: text("id").primaryKey(),
    schoolName: text("school_name").notNull(),
    schoolCity: text("school_city"),
    schoolState: text("school_state"),
    admissionRate: numeric("latest_admissions_admission_rate_overall"),
    tuitionOutOfState: text("latest_cost_tuition_out_of_state"),
    satScoreAverage: integer("latest_admissions_sat_scores_average_overall"),
    studentSize: text("latest_student_size"),
    imageUrl: text("image_url"),
    address: text("address"),
    phone: text("phone"),
    internationalEmail: text("international_email"),
    yearOfEstablishment: text("year_of_establishment"),
    totalForeignStudents: text("total_foreign_students"),
    noOfCampus: text("no_of_campus"),
    overallGraduationRate: text("overall_graduation_rate"),
    ugRaceJson: jsonb("ug_race_json").$type<{
      Asian?: string;
      Black?: string;
      Others?: string;
      Hispanic?: string;
    }>(),
    ugStudentResidenceJson: jsonb("ug_student_residence_json").$type<{
      Foreign?: string;
      "In state"?: string;
      "Out of state"?: string;
    }>(),
    ugAgeDistributionJson: jsonb("ug_age_distribution_json").$type<{
      "25 and over"?: string;
      "24 and under"?: string;
    }>(),
    graduationRate: text("graduation_rate"),
    postGradEarnings: text("post_grad_earnings"),
    medianFamilyIncome: text("median_family_income"),
    retentionRate: numeric("retention_rate"),
    shareFirstGeneration: numeric("share_first_generation"),
    plusLoanDebtMedian: integer("plus_loan_debt_median"),
    pellGrantRate: numeric("pell_grant_rate"),
    federalLoanRate: numeric("federal_loan_rate"),
    avgFamilyIncome: text("avg_family_income"),
    actScoreMidpoint: text("act_score_midpoint"),
    totalEnrollment: text("total_enrollment"),
    undergraduateEnrollment: text("undergraduate_enrollment"),
    graduateEnrollment: integer("graduate_enrollment"),
    femaleShare: numeric("female_share"),
    maleShare: numeric("male_share"),
    medianDebt: text("median_debt"),
    website: text("website"),
    virtualTour: text("virtual_tour"),
    campusSetting: text("campus_setting"),
    servicesData: jsonb("services_data").$type<{
      campus_security?: string[];
      student_services?: string[];
    }>(),
    admissionsFactors: jsonb("admissions_factors").$type<
      Record<string, string>
    >(),
    applicationDeadlines: jsonb("application_deadlines"),
    applicationRequirements: jsonb("application_requirements").$type<
      Array<{
        Area?: string;
        Details?: string;
        Required?: string;
        Recommended?: string;
        "Required for Some"?: string;
      }>
    >(),
    alias: text("alias"),
    aboutSection: text("about_section"),
    essayPrompts: jsonb("essay_prompts"),
    mathSatRange: text("math_sat_range"),
    readingSatRange: text("reading_sat_range"),
    satAcceptanceChances: jsonb("sat_acceptance_chances").$type<{
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
    }>(),
    greekLife: text("greek_life"),
    environment: text("environment"),
    politicalAndSocialClimate: text("political_and_social_climate"),
    costOfLiving: text("cost_of_living"),
    safetyAndCrime: text("safety_and_crime"),
    healthAndWellbeing: text("health_and_wellbeing"),
    gymAndHealth: text("gym_and_health"),
    usNewsNationalRanking: text("us_news_national_ranking"),
  },
  (table) => ({
    nameIdx: index("us_college_name_idx").on(table.schoolName),
    stateIdx: index("us_college_state_idx").on(table.schoolState),
    cityIdx: index("us_college_city_idx").on(table.schoolCity),
  })
);

// UK Colleges Schema
export const ukCollege = pgTable(
  "uk_colleges_rows",
  {
    id: text("id").primaryKey(),
    universityName: text("University Name").notNull(),
    location: text("Location"),
    tuitionFees: text("Tuition Fees"),
    examsAccepted: text("Exams Accepted"),
    scholarships: text("Scholarships"),
    imageUrl: text("image_url"),
    address: text("address"),
    phone: text("phone"),
    internationalEmail: text("international_email"),
    yearOfEstablishment: text("year_of_establishment"),
    totalForeignStudents: text("total_foreign_students"),
    numberOfCampuses: text("number_of_campuses"),
    onCampusAccommodation: text("on_campus_accommodation"),
    offCampusAccommodation: text("off_campus_accommodation"),
    sizeOfCity: text("Size_of_City"),
    academicRequirements: text("Academic_Requirements"),
    studentComposition: text("student_composition"),
    historicRanking: jsonb("historic_ranking").$type<
      Record<
        string,
        Array<{
          rank: number;
          year: number;
        }>
      >
    >(),
    about: text("About"),
    website: text("website"),
    studentLifeInfo: text("student_life_info"),
    populationOfCity: text("Population_of_City"),
  },
  (table) => ({
    nameIdx: index("uk_college_name_idx").on(table.universityName),
    locationIdx: index("uk_college_location_idx").on(table.location),
  })
);

export type USCollege = typeof usCollege.$inferSelect;
export type UKCollege = typeof ukCollege.$inferSelect;
