import * as schema from "../schema";

import { InferInsertModel, and, db, desc, eq, isNull } from "..";
import { alias } from "drizzle-orm/pg-core";

type SessionInsert = InferInsertModel<typeof schema.session>;

export const createSession = async (data: {
  studentUserId?: string | null;
  advisorUserId?: string | null;
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
      title: true,
      createdAt: true,
    },
  });
};

export const getScheduledSessionByCreatedSessionId = async (input: {
  sessionId: string;
}) => {
  const { sessionId } = input;

  const session = db.query.scheduledSession.findFirst({
    where: eq(schema.scheduledSession.createdSessionId, sessionId),
    columns: {
      botId: true,
      studentUserId: true,
      createdSessionId: true,
    },
  });

  return session;
};

export const getAutoSyncedSessions = async () => {
  return db
    .select({
      id: schema.session.id,
      title: schema.session.title,
      createdAt: schema.session.createdAt,
    })
    .from(schema.session)
    .where(
      and(
        isNull(schema.session.studentUserId),
        isNull(schema.session.advisorUserId),
        isNull(schema.session.deletedAt)
      )
    );
};

export const getSessions = async (data: { studentUserId?: string } = {}) => {
  const advisorUser = alias(schema.user, "advisor_user");
  const studentUser = alias(schema.user, "student_user");

  const sessions = await db
    .select({
      // deprecate this "id" field
      id: schema.session.id,
      sessionId: schema.session.id,
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
    .orderBy(desc(schema.session.createdAt))
    .where(
      and(
        isNull(schema.session.deletedAt),
        ...(data.studentUserId
          ? [eq(schema.session.studentUserId, data.studentUserId)]
          : [])
      )
    );

  return sessions.map((s) => ({
    sessionId: s.id,
    student: s.student?.name ?? "",
    createdAt: s.createdAt,
    title: s.title,
    advisor: s.advisor?.name ?? "",
  }));
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
    columns: {
      summary: true,
      createdAt: true,
      title: true,
      studentUserId: true,
    },
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

export const updateSessionById = async (
  input: { sessionId: string } & Partial<SessionInsert>
) => {
  return db
    .update(schema.session)
    .set(input)
    .where(eq(schema.session.id, input.sessionId));
};

export const deleteSessionById = async (input: { sessionId: string }) => {
  return db
    .update(schema.session)
    .set({ deletedAt: new Date() })
    .where(eq(schema.session.id, input.sessionId));
};

export const getAutoSyncSessionById = async (input: { sessionId: string }) => {
  return db.query.session.findFirst({
    where: eq(schema.session.id, input.sessionId),
    columns: {
      advisorUserId: true,
      studentUserId: true,
      summary: true,
      title: true,
      createdAt: true,
    },
  });
};
