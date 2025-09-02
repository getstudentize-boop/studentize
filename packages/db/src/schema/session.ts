import { pgTable, serial, text } from "drizzle-orm/pg-core";

import { createdAt } from "./utils";

export const session = pgTable("session", {
  id: serial("id").primaryKey(),
  createdAt,
  studentId: text("student_id").notNull(),
  advisorId: text("advisor_id").notNull(),
  title: text("title").notNull(),
});
