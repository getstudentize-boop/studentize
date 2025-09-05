import { pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

export const session = pgTable("session", {
  id,
  createdAt,
  studentUserId: text("student_user_id").notNull(),
  advisorUserId: text("advisor_user_id").notNull(),
  title: text("title").notNull(),
});
