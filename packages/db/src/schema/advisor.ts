import { jsonb, pgTable, text, unique } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

export const advisor = pgTable("advisor", {
  id,
  createdAt,
  universityName: text("university_name").notNull(),
  courseMajor: text("course_major").notNull(),
  courseMinor: text("course_minor"),
  userId: text("user_id").notNull(),
});

export const advisorStudentAccess = pgTable("advisor_student_access", {
  id,
  createdAt,
  advisorUserId: text("advisor_user_id").notNull(),
  studentUserId: text("student_user_id").notNull(),
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
});

export const advisorChatMessageTool = pgTable("advisor_chat_message_tool", {
  id,
  createdAt,
  messageId: text("message_id").notNull(),
  toolCallId: text("tool_call_id").notNull(),
  toolName: text("tool_name").notNull(),
  input: jsonb("input").notNull().$type<Record<string, any>>().default({}),
  output: jsonb("output").notNull().$type<Record<string, any>>().default({}),
});
