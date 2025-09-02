import { jsonb, pgTable, serial, text } from "drizzle-orm/pg-core";

import { createdAt } from "./utils";

export const student = pgTable("student", {
  id: serial("id").primaryKey(),
  createdAt,
  userId: text("user_id").notNull(),
  location: text("location"),
  gradeLevel: text("grade_level"),
  academicPerformance: text("academic_performance"),
  testScores: text("test_scores"),
  primaryAcademicInterests: jsonb("primary_academic_interests"),
  applicationStage: jsonb("application_stage"),
  mainExtracurriculars: jsonb("main_extracurriculars"),
  target: jsonb("target").$type<{
    university: string;
    geography: string;
  }>(),
});
