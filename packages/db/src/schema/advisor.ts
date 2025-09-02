import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

import { createdAt } from "./utils";

export const advisor = pgTable("advisor", {
  id: serial("id").primaryKey(),
  createdAt,
  universityName: text("university_name").notNull(),
  courseMajor: text("course_major").notNull(),
  courseMinor: text("course_minor"),
  userId: text("user_id").notNull(),
});
