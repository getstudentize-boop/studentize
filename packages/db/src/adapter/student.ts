import { db, InferSelectModel, InferInsertModel, eq } from "..";

import * as schema from "../schema";

import {} from "drizzle-orm/pg-core";

type StudentSelect = InferSelectModel<typeof schema.student>;
type StudentUser = InferInsertModel<typeof schema.student>;

export const createBaseStudent = async (data: { userId: string }) => {
  const student = await db
    .insert(schema.student)
    .values({ userId: data.userId })
    .returning({ id: schema.student.id });

  return student;
};

export const getStudents = async () => {
  const students = await db
    .select({
      studentId: schema.student.id,
      userId: schema.user.id,
      email: schema.user.email,
      name: schema.user.name,
    })
    .from(schema.student)
    .innerJoin(schema.user, eq(schema.student.userId, schema.user.id));

  return students;
};

export const getFullStudentList = async () => {
  const students = await db
    .select({
      userId: schema.user.id,
      email: schema.user.email,
      name: schema.user.name,
    })
    .from(schema.user)
    .where(eq(schema.user.type, "STUDENT"));

  return students;
};

export const getAdvisorStudentList = async (input: {
  advisorUserId: string;
}) => {
  const students = await db
    .select({
      userId: schema.user.id,
      email: schema.user.email,
      name: schema.user.name,
    })
    .from(schema.advisorStudentAccess)
    .innerJoin(
      schema.user,
      eq(schema.advisorStudentAccess.studentUserId, schema.user.id)
    )
    .where(eq(schema.advisorStudentAccess.advisorUserId, input.advisorUserId));

  return students;
};
