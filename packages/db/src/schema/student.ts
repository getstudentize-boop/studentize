import { jsonb, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

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
});
