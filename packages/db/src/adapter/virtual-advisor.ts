import * as schema from "../schema";

import { InferInsertModel, and, db, desc, eq } from "..";

type VirtualAdvisorSessionInsert = InferInsertModel<
  typeof schema.virtualAdvisorSession
>;
type VirtualAdvisorMessageInsert = InferInsertModel<
  typeof schema.virtualAdvisorMessage
>;

export const createVirtualAdvisorSession = async (data: {
  studentUserId: string;
  advisorSlug: string;
  title?: string;
}) => {
  const [session] = await db
    .insert(schema.virtualAdvisorSession)
    .values({
      studentUserId: data.studentUserId,
      advisorSlug: data.advisorSlug,
      title: data.title,
    })
    .returning({ id: schema.virtualAdvisorSession.id });

  return session;
};

export const getVirtualAdvisorSessionById = async (input: {
  sessionId: string;
  studentUserId: string;
}) => {
  const session = await db.query.virtualAdvisorSession.findFirst({
    where: and(
      eq(schema.virtualAdvisorSession.id, input.sessionId),
      eq(schema.virtualAdvisorSession.studentUserId, input.studentUserId)
    ),
  });

  if (!session) return null;

  const messages = await db.query.virtualAdvisorMessage.findMany({
    where: eq(schema.virtualAdvisorMessage.sessionId, input.sessionId),
    orderBy: [schema.virtualAdvisorMessage.createdAt],
  });

  return {
    ...session,
    messages,
  };
};

export const getVirtualAdvisorSessionsByStudent = async (input: {
  studentUserId: string;
}) => {
  return db
    .select({
      id: schema.virtualAdvisorSession.id,
      title: schema.virtualAdvisorSession.title,
      advisorSlug: schema.virtualAdvisorSession.advisorSlug,
      createdAt: schema.virtualAdvisorSession.createdAt,
      endedAt: schema.virtualAdvisorSession.endedAt,
    })
    .from(schema.virtualAdvisorSession)
    .where(eq(schema.virtualAdvisorSession.studentUserId, input.studentUserId))
    .orderBy(desc(schema.virtualAdvisorSession.createdAt));
};

export const updateVirtualAdvisorSession = async (
  input: { sessionId: string } & Partial<VirtualAdvisorSessionInsert>
) => {
  const { sessionId, ...data } = input;

  return db
    .update(schema.virtualAdvisorSession)
    .set(data)
    .where(eq(schema.virtualAdvisorSession.id, sessionId));
};

export const createVirtualAdvisorMessage = async (
  data: VirtualAdvisorMessageInsert
) => {
  const [message] = await db
    .insert(schema.virtualAdvisorMessage)
    .values(data)
    .returning();

  return message;
};

export const createVirtualAdvisorMessages = async (
  messages: VirtualAdvisorMessageInsert[]
) => {
  if (messages.length === 0) return [];

  const inserted = await db
    .insert(schema.virtualAdvisorMessage)
    .values(messages)
    .returning();

  return inserted;
};
