import { pgTable, text, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { id, createdAt } from "./utils";

export const taskStatus = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
]);

export const taskPriority = pgEnum("task_priority", ["low", "medium", "high"]);

export const taskCategory = pgEnum("task_category", [
  "profile_building",
  "essay_writing",
  "university_research",
  "exams",
  "sat_act",
  "other",
]);

export const studentTask = pgTable(
  "student_task",
  {
    id,
    createdAt,
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    studentUserId: text("student_user_id").notNull(),
    assignedByUserId: text("assigned_by_user_id"), // who assigned it (student or advisor)
    title: text("title").notNull(),
    description: text("description"),
    dueDate: timestamp("due_date"),
    status: taskStatus("status").notNull().default("pending"),
    priority: taskPriority("priority").notNull().default("medium"),
    category: taskCategory("category").notNull(),
    customCategory: text("custom_category"), // for "other" category
    completedAt: timestamp("completed_at"),
  },
  (table) => [index("student_task_student_user_id_idx").on(table.studentUserId)]
);

export type StudentTask = typeof studentTask.$inferSelect;
export type NewStudentTask = typeof studentTask.$inferInsert;
