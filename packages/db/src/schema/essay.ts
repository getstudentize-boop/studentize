import { pgTable, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { id, createdAt } from "./utils";

export const essay = pgTable(
  "essay",
  {
    id,
    createdAt,
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    studentUserId: text("student_user_id").notNull(),
    title: text("title").notNull(),
    prompt: text("prompt"),
    content: jsonb("content").$type<any>(), // TipTap JSON content
    region: text("region").notNull().default("US"), // "US" | "UK" | "Other"
  },
  (table) => ({
    studentUserIdIdx: index("essay_student_user_id_idx").on(table.studentUserId),
    studentRegionIdx: index("essay_student_region_idx").on(
      table.studentUserId,
      table.region,
    ),
  }),
);

export type Essay = typeof essay.$inferSelect;
export type NewEssay = typeof essay.$inferInsert;
