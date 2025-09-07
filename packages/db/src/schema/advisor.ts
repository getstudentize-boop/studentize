import { jsonb, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

export const advisor = pgTable("advisor", {
  id,
  createdAt,
  universityName: text("university_name").notNull(),
  courseMajor: text("course_major").notNull(),
  courseMinor: text("course_minor"),
  userId: text("user_id").notNull(),
});

type Tool = {
  toolId: string;
  toolName: string;
  result?: Record<string, any>;
};

export const advisorChat = pgTable("advisor_chat", {
  id,
  title: text("title").notNull(),
  createdAt,
  userId: text("user_id").notNull(),
  studentId: text("student_id").notNull(),
});

export const advisorChatMessage = pgTable("advisor_chat_message", {
  id,
  content: text("content").notNull(),
  role: text("role").notNull().$type<"user" | "assistant">(),
  chatId: text("chat_id").notNull(),
  createdAt,
  tools: jsonb("tools").$type<Tool[]>().default([]),
});
