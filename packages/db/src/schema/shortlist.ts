import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { id, createdAt } from "./utils";

export const shortlistCategory = pgEnum("shortlist_category", [
  "reach",
  "target",
  "safety",
]);

export const shortlistSource = pgEnum("shortlist_source", ["ai", "manual"]);

export const universityShortlist = pgTable("university_shortlist", {
  id,
  createdAt,
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  studentUserId: text("student_user_id").notNull(),
  collegeId: text("college_id").notNull(),
  country: text("country").notNull(), // "us" or "uk"
  category: shortlistCategory("category"),
  source: shortlistSource("source").notNull().default("manual"),
  notes: text("notes"),
});

export type UniversityShortlist = typeof universityShortlist.$inferSelect;
export type NewUniversityShortlist = typeof universityShortlist.$inferInsert;
