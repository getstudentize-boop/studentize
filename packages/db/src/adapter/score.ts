import { db, eq, and, desc, InferInsertModel, InferSelectModel } from "..";
import * as schema from "../schema";

type ScoreInsert = InferInsertModel<typeof schema.studentScore>;

export const createScore = async (data: ScoreInsert) => {
  const [score] = await db.insert(schema.studentScore).values(data).returning();

  return score;
};

export const getStudentScores = async (studentUserId: string) => {
  const scores = await db.query.studentScore.findMany({
    where: eq(schema.studentScore.studentUserId, studentUserId),
    orderBy: desc(schema.studentScore.examDate),
  });

  return scores;
};

export const updateScore = async (input: {
  scoreId: string;
  studentUserId: string;
  subject?: string;
  score?: number;
  maxScore?: number;
  examDate?: Date;
  notes?: string | null;
}) => {
  const { scoreId, studentUserId, ...updateData } = input;

  const [updated] = await db
    .update(schema.studentScore)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.studentScore.id, scoreId),
        eq(schema.studentScore.studentUserId, studentUserId),
      ),
    )
    .returning();

  return updated;
};

export const deleteScore = async (input: {
  scoreId: string;
  studentUserId: string;
}) => {
  await db
    .delete(schema.studentScore)
    .where(
      and(
        eq(schema.studentScore.id, input.scoreId),
        eq(schema.studentScore.studentUserId, input.studentUserId),
      ),
    );

  return { success: true };
};
