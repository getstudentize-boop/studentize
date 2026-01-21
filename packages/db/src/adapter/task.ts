import { db, eq, and, desc, InferInsertModel, InferSelectModel } from "..";
import * as schema from "../schema";

type TaskInsert = InferInsertModel<typeof schema.studentTask>;
type TaskSelect = InferSelectModel<typeof schema.studentTask>;

export const createTask = async (data: TaskInsert) => {
  const [task] = await db.insert(schema.studentTask).values(data).returning();

  return task;
};

export const getTaskById = async (input: {
  taskId: string;
  studentUserId: string;
}) => {
  const [task] = await db
    .select()
    .from(schema.studentTask)
    .where(
      and(
        eq(schema.studentTask.id, input.taskId),
        eq(schema.studentTask.studentUserId, input.studentUserId)
      )
    );

  return task;
};

export const getStudentTasks = async (studentUserId: string) => {
  const tasks = await db.query.studentTask.findMany({
    where: eq(schema.studentTask.studentUserId, studentUserId),
    orderBy: [desc(schema.studentTask.createdAt)],
  });

  return tasks;
};

export const updateTask = async (input: {
  taskId: string;
  studentUserId: string;
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
  status?: "pending" | "in_progress" | "completed";
  priority?: "low" | "medium" | "high";
  category?: "profile_building" | "essay_writing" | "university_research" | "exams" | "sat_act" | "other";
  customCategory?: string | null;
  completedAt?: Date | null;
}) => {
  const { taskId, studentUserId, ...updateData } = input;

  const [updated] = await db
    .update(schema.studentTask)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.studentTask.id, taskId),
        eq(schema.studentTask.studentUserId, studentUserId)
      )
    )
    .returning();

  return updated;
};

export const deleteTask = async (input: {
  taskId: string;
  studentUserId: string;
}) => {
  await db
    .delete(schema.studentTask)
    .where(
      and(
        eq(schema.studentTask.id, input.taskId),
        eq(schema.studentTask.studentUserId, input.studentUserId)
      )
    );

  return { success: true };
};
