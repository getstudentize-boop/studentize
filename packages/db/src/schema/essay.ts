import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { id, createdAt } from "./utils";

export const essay = pgTable("essay", {
  id,
  createdAt,
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  studentUserId: text("student_user_id").notNull(),
  title: text("title").notNull(),
  prompt: text("prompt"),
  content: jsonb("content").$type<any>(), // TipTap JSON content
});

export type Essay = typeof essay.$inferSelect;
export type NewEssay = typeof essay.$inferInsert;
