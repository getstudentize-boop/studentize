import { db, eq, and, desc, InferInsertModel, InferSelectModel } from "..";
import * as schema from "../schema";

type EssayInsert = InferInsertModel<typeof schema.essay>;
type EssaySelect = InferSelectModel<typeof schema.essay>;

export const createEssay = async (data: EssayInsert) => {
  const [essay] = await db.insert(schema.essay).values(data).returning();
  return essay;
};

export const getEssayById = async (input: { essayId: string; studentUserId: string }) => {
  const [essay] = await db
    .select()
    .from(schema.essay)
    .where(
      and(
        eq(schema.essay.id, input.essayId),
        eq(schema.essay.studentUserId, input.studentUserId)
      )
    );

  return essay;
};

export const listEssaysByStudent = async (studentUserId: string) => {
  const essays = await db
    .select()
    .from(schema.essay)
    .where(eq(schema.essay.studentUserId, studentUserId))
    .orderBy(desc(schema.essay.updatedAt));

  return essays;
};

export const updateEssay = async (input: {
  essayId: string;
  studentUserId: string;
  content?: any;
  title?: string;
  prompt?: string;
}) => {
  const { essayId, studentUserId, ...updateData } = input;

  const [updated] = await db
    .update(schema.essay)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.essay.id, essayId),
        eq(schema.essay.studentUserId, studentUserId)
      )
    )
    .returning();

  return updated;
};

export const deleteEssay = async (input: {
  essayId: string;
  studentUserId: string;
}) => {
  await db
    .delete(schema.essay)
    .where(
      and(
        eq(schema.essay.id, input.essayId),
        eq(schema.essay.studentUserId, input.studentUserId)
      )
    );

  return { success: true };
};
