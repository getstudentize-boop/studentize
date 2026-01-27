import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { id, createdAt } from "./utils";

// Status enum for aptitude test sessions
export const aptitudeTestStatus = pgEnum("aptitude_test_status", [
  "not_started",
  "in_progress",
  "completed",
]);

// Interest match type for results
export type InterestMatch = {
  interest: string;
  matchPercentage: number;
  reasoning?: string;
  careers?: Array<{
    title: string;
    category: string;
    emoji?: string;
    major: string;
    fitReason?: string;
  }>;
};

// Career type for results
export type Career = {
  title: string;
  category: string;
  emoji?: string;
  major: string;
  fitReason?: string;
};

// Questions and answers structure
export type QuestionsResponses = {
  questions: string[];
  answers: string[];
};

// Main aptitude test session table
export const aptitudeTestSession = pgTable(
  "aptitude_test_session",
  {
    id,
    createdAt,
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),

    // Foreign key to student
    studentUserId: text("student_user_id").notNull(),

    // Status tracking
    status: aptitudeTestStatus("status").notNull().default("not_started"),
    currentStep: integer("current_step").notNull().default(1), // 1-4

    // Step 1: Favorite Subjects (array of subject names)
    favoriteSubjects: jsonb("favorite_subjects")
      .$type<string[]>()
      .default([])
      .notNull(),

    // Step 2: Subject Comfort Levels (map of category -> level 1-5)
    subjectComfortLevels: jsonb("subject_comfort_levels")
      .$type<Record<string, number>>()
      .default({})
      .notNull(),

    // Step 3: Questions and Answers
    questionsResponses: jsonb("questions_responses")
      .$type<QuestionsResponses>()
      .default({ questions: [], answers: [] })
      .notNull(),

    // Step 4: Results
    generatedInterests: jsonb("generated_interests")
      .$type<string[]>()
      .default([])
      .notNull(),
    recommendations: text("recommendations"),
    interestMatches: jsonb("interest_matches")
      .$type<InterestMatch[]>()
      .default([])
      .notNull(),
    careers: jsonb("careers").$type<Career[]>().default([]).notNull(),

    // Hidden flag for soft delete (still counts toward limit)
    isHidden: integer("is_hidden").notNull().default(0),
  },
  (table) => [
    index("aptitude_test_session_student_user_id_idx").on(table.studentUserId),
  ]
);

export type AptitudeTestSession = typeof aptitudeTestSession.$inferSelect;
export type NewAptitudeTestSession = typeof aptitudeTestSession.$inferInsert;
