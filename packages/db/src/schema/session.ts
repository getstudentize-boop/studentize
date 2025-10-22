import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

export const session = pgTable("session", {
  id,
  createdAt,
  studentUserId: text("student_user_id").notNull(),
  advisorUserId: text("advisor_user_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").default(""),
  deletedAt: timestamp("deleted_at"),
});

export const scheduledSession = pgTable("scheduled_session", {
  id,
  createdAt,
  doneAt: timestamp("done_at"),
  deletedAt: timestamp("deleted_at"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  advisorUserId: text("advisor_user_id").notNull(),
  studentUserId: text("student_user_id").notNull(),
  meetingCode: text("meeting_code").notNull(),
  botId: text("bot_id"),
  title: text("title").notNull(),
});
