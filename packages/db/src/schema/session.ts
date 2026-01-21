import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

export const session = pgTable("session", {
  id,
  createdAt,
  studentUserId: text("student_user_id"),
  advisorUserId: text("advisor_user_id"),
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
  advisorUserId: text("advisor_user_id"),
  studentUserId: text("student_user_id"),
  meetingCode: text("meeting_code").notNull(),
  botId: text("bot_id"),
  title: text("title").notNull(),
  googleEventId: text("google_event_id"),
  createdSessionId: text("created_session_id"),
  // When a bot is re-sent to a meeting that already has a botId,
  // a new scheduled session is created and this field points to it
  supersededById: text("superseded_by_id"),
});
