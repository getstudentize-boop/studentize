import * as schema from "../schema";

import { InferInsertModel, InferSelectModel, db, eq } from "..";
import { alias } from "drizzle-orm/pg-core";

type SessionInsert = InferInsertModel<typeof schema.session>;
type SessionSelect = InferSelectModel<typeof schema.session>;

export const createSession = async (data: {
  studentUserId: string;
  advisorUserId: string;
  title: string;
}) => {
  const [session] = await db
    .insert(schema.session)
    .values({
      studentUserId: data.studentUserId,
      advisorUserId: data.advisorUserId,
      title: data.title,
    })
    .returning({ id: schema.session.id });

  return session;
};

export const getSessionById = (input: { sessionId: string }) => {
  return db.query.session.findFirst({
    where: eq(schema.session.id, input.sessionId),
    columns: {
      advisorUserId: true,
      studentUserId: true,
    },
  });
};

export const getSessions = async (data: { studentUserId?: string } = {}) => {
  const advisorUser = alias(schema.user, "advisor_user");
  const studentUser = alias(schema.user, "student_user");

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
    .innerJoin(studentUser, eq(schema.session.studentUserId, studentUser.id))
    .innerJoin(advisorUser, eq(schema.session.advisorUserId, advisorUser.id));

  const sessions = data.studentUserId
    ? await query.where(eq(schema.session.studentUserId, data.studentUserId))
    : await query;

  return sessions;
};

export const updateSessionSummary = async (input: {
  sessionId: string;
  summary: string;
}) => {
  await db
    .update(schema.session)
    .set({ summary: input.summary })
    .where(eq(schema.session.id, input.sessionId));
};
