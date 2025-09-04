import * as schema from "../schema";

import { InferInsertModel, InferSelectModel, db, eq } from "..";
import { alias } from "drizzle-orm/pg-core";

type SessionInsert = InferInsertModel<typeof schema.session>;
type SessionSelect = InferSelectModel<typeof schema.session>;

export const createSession = async (data: {
  studentId: string;
  advisorId: string;
  title: string;
}) => {
  const [session] = await db
    .insert(schema.session)
    .values({
      studentId: data.studentId,
      advisorId: data.advisorId,
      title: data.title,
    })
    .returning({ id: schema.session.id });

  return session;
};

export const getSessions = async (data: { studentId?: string } = {}) => {
  const advisorUser = alias(schema.user, "advisor");
  const studentUser = alias(schema.user, "student");

  const query = db
    .select({
      id: schema.session.id,
      title: schema.session.title,
      createdAt: schema.session.createdAt,
      student: {
        name: studentUser.name,
      },
      advisor: {
        name: advisorUser.name,
      },
    })
    .from(schema.session)
    .leftJoin(schema.student, eq(schema.session.studentId, schema.student.id))
    .leftJoin(schema.advisor, eq(schema.session.advisorId, schema.advisor.id))
    //
    .leftJoin(studentUser, eq(schema.student.userId, studentUser.id))
    .leftJoin(advisorUser, eq(schema.advisor.userId, advisorUser.id));

  const sessions = data.studentId
    ? await query.where(eq(schema.session.studentId, data.studentId))
    : await query;

  return sessions;
};
