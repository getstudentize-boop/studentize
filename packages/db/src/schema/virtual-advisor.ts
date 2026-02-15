import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

export const virtualAdvisorSession = pgTable("virtual_advisor_session", {
  id,
  createdAt,
  studentUserId: text("student_user_id").notNull(),
  advisorSlug: text("advisor_slug").notNull(), // zain, john, ron, etc.
  title: text("title"),
  endedAt: timestamp("ended_at"),
});

export const virtualAdvisorMessage = pgTable("virtual_advisor_message", {
  id,
  createdAt,
  sessionId: text("session_id")
    .notNull()
    .references(() => virtualAdvisorSession.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant"
  text: text("text").notNull(),
});
