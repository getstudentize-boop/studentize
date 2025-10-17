import {
  db,
  InferSelectModel,
  InferInsertModel,
  eq,
  getTableColumns,
  desc,
} from "..";

import * as schema from "../schema";

import {} from "drizzle-orm/pg-core";

type StudentSelect = InferSelectModel<typeof schema.student>;
type StudentInsert = InferInsertModel<typeof schema.student>;

export const createBaseStudent = async (data: { userId: string }) => {
  const student = await db
    .insert(schema.student)
    .values({ userId: data.userId })
    .returning({ id: schema.student.id });

  return student;
};

export const updateStudentByUserId = async (
  userId: string,
  data: Partial<StudentInsert>
) => {
  const [student] = await db
    .update(schema.student)
    .set(data)
    .where(eq(schema.student.userId, userId))
    .returning({ studentId: schema.student.id });

  return student;
};

export const getStudentByUserId = async (userId: string) => {
  const [student] = await db
    .select({
      ...getTableColumns(schema.student),
      name: schema.user.name,
    })
    .from(schema.student)
    .innerJoin(schema.user, eq(schema.student.userId, schema.user.id))
    .where(eq(schema.student.userId, userId));

  return student as typeof student | undefined;
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
      studyCurriculum: schema.student.studyCurriculum,
      targetCountries: schema.student.targetCountries,
    })
    .from(schema.user)
    .innerJoin(schema.student, eq(schema.student.userId, schema.user.id))
    .where(eq(schema.user.type, "STUDENT"));

  return students;
};

export const getAdvisorStudentList = async (input: {
  advisorUserId: string;
}) => {
  const students = await db
    .select({
      userId: schema.user.id,
      name: schema.user.name,
      studyCurriculum: schema.student.studyCurriculum,
      targetCountries: schema.student.targetCountries,
    })
    .from(schema.advisorStudentAccess)
    .innerJoin(
      schema.student,
      eq(schema.advisorStudentAccess.studentUserId, schema.student.userId)
    )
    .innerJoin(
      schema.user,
      eq(schema.advisorStudentAccess.studentUserId, schema.user.id)
    )
    .where(eq(schema.advisorStudentAccess.advisorUserId, input.advisorUserId));

  return students;
};

export const getStudentSessionOverview = async (studentUserId: string) => {
  return db.query.student.findFirst({
    where: eq(schema.student.userId, studentUserId),
    columns: {
      sessionOverview: true,
    },
  });
};

export const updateStudentSessionOverview = async (input: {
  studentUserId: string;
  sessionOverview: string;
}) => {
  const [student] = await db
    .update(schema.student)
    .set({ sessionOverview: input.sessionOverview })
    .where(eq(schema.student.userId, input.studentUserId));

  return student;
};

export const getStudentSessionHistory = async (input: {
  studentUserId: string;
}) => {
  const student = await db
    .select({
      createdAt: schema.session.createdAt,
      title: schema.session.title,
      id: schema.session.id,
    })
    .from(schema.session)
    .where(eq(schema.session.studentUserId, input.studentUserId))
    .orderBy(desc(schema.session.createdAt));

  return student;
};
