import { pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

export const advisor = pgTable("advisor", {
  id,
  createdAt,
  universityName: text("university_name").notNull(),
  courseMajor: text("course_major").notNull(),
  courseMinor: text("course_minor"),
  userId: text("user_id").notNull(),
});
