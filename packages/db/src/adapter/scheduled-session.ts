import { db, eq, isNull, schema } from "..";

export const createScheduleSession = async ({
  scheduledAt,
  advisorUserId,
  studentUserId,
  meetingCode,
  title,
}: {
  scheduledAt: Date;
  advisorUserId: string;
  studentUserId: string;
  meetingCode: string;
  title: string;
}) => {
  const [session] = await db
    .insert(schema.scheduledSession)
    .values({
      scheduledAt,
      advisorUserId,
      studentUserId,
      meetingCode,
      title,
    })
    .returning({ id: schema.scheduledSession.id });

  return { scheduledSessionId: session.id };
};

export const getScheduledSessionList = async () => {
  return db.query.scheduledSession.findMany({
    where: isNull(schema.scheduledSession.doneAt),
    columns: {
      advisorUserId: true,
      studentUserId: true,
      scheduledAt: true,
      meetingCode: true,
      title: true,
      id: true,
      botId: true,
    },
  });
};

export const getScheduledSessionById = async (input: {
  scheduledSessionId: string;
}) => {
  return db.query.scheduledSession.findFirst({
    where: (session, { eq }) => eq(session.id, input.scheduledSessionId),
    columns: {
      advisorUserId: true,
      studentUserId: true,
      scheduledAt: true,
      meetingCode: true,
      title: true,
      id: true,
    },
  });
};

export const getScheduledSessionByBotId = async (input: { botId: string }) => {
  return db.query.scheduledSession.findFirst({
    where: (scheduledSession, { eq, isNull, and }) =>
      and(
        eq(scheduledSession.botId, input.botId),
        isNull(scheduledSession.doneAt)
      ),
    columns: {
      advisorUserId: true,
      studentUserId: true,
      scheduledAt: true,
      meetingCode: true,
      title: true,
      id: true,
    },
  });
};

export const getScheduledSessionTimeById = async (input: {
  scheduledSessionId: string;
}) => {
  const session = await db.query.scheduledSession.findFirst({
    where: (session, { eq }) => eq(session.id, input.scheduledSessionId),
    columns: {
      scheduledAt: true,
    },
  });

  return session;
};

export const updateScheduledSessionBotId = async (input: {
  scheduledSessionId: string;
  botId: string;
}) => {
  await db
    .update(schema.scheduledSession)
    .set({ botId: input.botId })
    .where(eq(schema.scheduledSession.id, input.scheduledSessionId));
};

export const updateScheduledSessionDoneAt = async (input: {
  scheduledSessionId: string;
  doneAt: Date;
}) => {
  await db
    .update(schema.scheduledSession)
    .set({ doneAt: input.doneAt })
    .where(eq(schema.scheduledSession.id, input.scheduledSessionId));
};
