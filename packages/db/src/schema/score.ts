import { pgTable, text, timestamp, integer, real, index } from "drizzle-orm/pg-core";
import { id, createdAt } from "./utils";

export const studentScore = pgTable(
  "student_score",
  {
    id,
    createdAt,
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    studentUserId: text("student_user_id").notNull(),
    subject: text("subject").notNull(), // e.g. "Mathematics", "Physics", "SAT", "ACT"
    score: real("score").notNull(), // the score value (e.g. 85, 1400)
    maxScore: real("max_score").notNull(), // max possible (e.g. 100, 1600)
    examDate: timestamp("exam_date").notNull(), // when the test was taken
    notes: text("notes"),
  },
  (table) => [
    index("student_score_student_user_id_idx").on(table.studentUserId),
    index("student_score_subject_idx").on(table.studentUserId, table.subject),
  ]
);

export type StudentScore = typeof studentScore.$inferSelect;
export type NewStudentScore = typeof studentScore.$inferInsert;
