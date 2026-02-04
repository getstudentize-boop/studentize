import { boolean, jsonb, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

export const statusType = pgEnum("status_type", ["ACTIVE", "INACTIVE"]);

export const student = pgTable("student", {
  id,
  createdAt,
  userId: text("user_id").notNull(),
  location: text("location"),
  sessionOverview: text("session_overview"),
  studyCurriculum: text("study_curriculum"),
  expectedGraduationYear: text("expected_graduation_year"),
  targetCountries: jsonb("target_countries").$type<string[]>().default([]),
  areasOfInterest: jsonb("areas_of_interest").$type<string[]>().default([]),
  status: statusType().default("ACTIVE"),
  extracurricular: jsonb("extracurricular")
    .$type<
      Array<{
        type: string;
        name: string;
        hoursPerWeek: number;
        yearsOfExperience: number;
        description?: string;
      }>
    >()
    .default([]),
  phone: text("phone"),
  referralSource: text("referral_source"),
  supportAreas: jsonb("support_areas").$type<string[]>().default([]),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
});
