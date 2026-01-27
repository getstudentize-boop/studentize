import { db, eq, and, desc, count, InferInsertModel } from "..";
import * as schema from "../schema";
import type {
  InterestMatch,
  Career,
  QuestionsResponses,
} from "../schema/aptitude";

type AptitudeSessionInsert = InferInsertModel<typeof schema.aptitudeTestSession>;

const MAX_TESTS_ALLOWED = 3;

// Create a new aptitude test session
export const createAptitudeSession = async (
  data: Omit<AptitudeSessionInsert, "id" | "createdAt">
) => {
  const [session] = await db
    .insert(schema.aptitudeTestSession)
    .values(data)
    .returning();

  return session;
};

// Get session by ID (with student ownership check)
export const getAptitudeSessionById = async (input: {
  sessionId: string;
  studentUserId: string;
}) => {
  const [session] = await db
    .select()
    .from(schema.aptitudeTestSession)
    .where(
      and(
        eq(schema.aptitudeTestSession.id, input.sessionId),
        eq(schema.aptitudeTestSession.studentUserId, input.studentUserId)
      )
    );

  return session;
};

// Get all sessions for a student (excluding hidden)
export const getStudentAptitudeSessions = async (studentUserId: string) => {
  const sessions = await db.query.aptitudeTestSession.findMany({
    where: and(
      eq(schema.aptitudeTestSession.studentUserId, studentUserId),
      eq(schema.aptitudeTestSession.isHidden, 0)
    ),
    orderBy: [desc(schema.aptitudeTestSession.createdAt)],
  });

  return sessions;
};

// Count total tests (including hidden) for limit check
export const countStudentAptitudeTests = async (studentUserId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(schema.aptitudeTestSession)
    .where(eq(schema.aptitudeTestSession.studentUserId, studentUserId));

  return {
    totalTests: result?.count || 0,
    canCreateNew: (result?.count || 0) < MAX_TESTS_ALLOWED,
    maxAllowed: MAX_TESTS_ALLOWED,
  };
};

// Update aptitude session
export const updateAptitudeSession = async (input: {
  sessionId: string;
  studentUserId: string;
  status?: "not_started" | "in_progress" | "completed";
  currentStep?: number;
  favoriteSubjects?: string[];
  subjectComfortLevels?: Record<string, number>;
  questionsResponses?: QuestionsResponses;
  generatedInterests?: string[];
  recommendations?: string;
  interestMatches?: InterestMatch[];
  careers?: Career[];
  completedAt?: Date | null;
}) => {
  const { sessionId, studentUserId, ...updateData } = input;

  const [updated] = await db
    .update(schema.aptitudeTestSession)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.aptitudeTestSession.id, sessionId),
        eq(schema.aptitudeTestSession.studentUserId, studentUserId)
      )
    )
    .returning();

  return updated;
};

// Hide (soft delete) a session
export const hideAptitudeSession = async (input: {
  sessionId: string;
  studentUserId: string;
}) => {
  const [updated] = await db
    .update(schema.aptitudeTestSession)
    .set({
      isHidden: 1,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.aptitudeTestSession.id, input.sessionId),
        eq(schema.aptitudeTestSession.studentUserId, input.studentUserId)
      )
    )
    .returning();

  return updated;
};
