import * as schema from "../schema";

import { InferInsertModel, InferSelectModel, db, desc, eq } from "..";
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
      summary: true,
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
    .innerJoin(advisorUser, eq(schema.session.advisorUserId, advisorUser.id))
    .orderBy(desc(schema.session.createdAt));

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

export const getSessionSummarysByStudent = async (input: {
  studentUserId: string;
}) => {
  return db
    .select({
      summary: schema.session.summary,
      createdAt: schema.session.createdAt,
      title: schema.session.title,
    })
    .from(schema.session)
    .where(eq(schema.session.studentUserId, input.studentUserId))
    .orderBy(desc(schema.session.createdAt));
};

export const getSessionSummaryById = async (input: { sessionId: string }) => {
  return db.query.session.findFirst({
    where: eq(schema.session.id, input.sessionId),
    columns: { summary: true, createdAt: true, title: true },
  });
};

export const getLatestSessionSummaryByStudent = async (input: {
  studentUserId: string;
}) => {
  return db.query.session.findFirst({
    where: eq(schema.session.studentUserId, input.studentUserId),
    orderBy: [desc(schema.session.createdAt)],
    columns: { summary: true, createdAt: true, title: true },
  });
};
