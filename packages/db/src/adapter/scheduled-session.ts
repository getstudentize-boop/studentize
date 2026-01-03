import { and, db, desc, eq, gte, isNull, lt, schema } from "..";

export const createScheduleSession = async ({
  scheduledAt,
  advisorUserId,
  studentUserId,
  meetingCode,
  title,
  googleEventId,
}: {
  scheduledAt: Date;
  advisorUserId?: string;
  studentUserId?: string;
  meetingCode: string;
  title: string;
  googleEventId?: string;
}) => {
  const [session] = await db
    .insert(schema.scheduledSession)
    .values({
      scheduledAt,
      advisorUserId,
      studentUserId,
      meetingCode,
      title,
      googleEventId,
    })
    .returning({ id: schema.scheduledSession.id });

  return { scheduledSessionId: session.id };
};

export const getScheduledSessionList = async () => {
  return db.query.scheduledSession.findMany({
    where: and(
      isNull(schema.scheduledSession.doneAt),
      isNull(schema.scheduledSession.deletedAt)
    ),
    orderBy: desc(schema.scheduledSession.scheduledAt),
    columns: {
      advisorUserId: true,
      studentUserId: true,
      scheduledAt: true,
      meetingCode: true,
      title: true,
      id: true,
      botId: true,
      googleEventId: true,
    },
  });
};

export const getScheduledSessionById = async (input: {
  scheduledSessionId: string;
}) => {
  return db.query.scheduledSession.findFirst({
    where: (session, { eq }) =>
      and(eq(session.id, input.scheduledSessionId), isNull(session.deletedAt)),
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

export const getScheduledSessionByBotId = async (input: { botId: string }) => {
  return db.query.scheduledSession.findFirst({
    where: (scheduledSession, { eq, isNull, and }) =>
      and(
        eq(scheduledSession.botId, input.botId),
        isNull(scheduledSession.doneAt),
        isNull(scheduledSession.deletedAt)
      ),
    columns: {
      advisorUserId: true,
      studentUserId: true,
      scheduledAt: true,
      meetingCode: true,
      title: true,
      id: true,
      googleEventId: true,
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
  createdSessionId: string;
  doneAt: Date;
}) => {
  await db
    .update(schema.scheduledSession)
    .set({ doneAt: input.doneAt, createdSessionId: input.createdSessionId })
    .where(eq(schema.scheduledSession.id, input.scheduledSessionId));
};

export const deleteScheduledSessionById = async (input: {
  scheduledSessionId: string;
}) => {
  await db
    .delete(schema.scheduledSession)
    .where(eq(schema.scheduledSession.id, input.scheduledSessionId));
};

export const getAdvisorsSessions = (input: {
  advisorUserId?: string;
  today: Date;
  timePeriod: "past" | "upcoming";
}) => {
  const ltOrGt = input.timePeriod === "past" ? lt : gte;

  return db
    .select({
      scheduledSessionId: schema.scheduledSession.id,
      title: schema.scheduledSession.title,
      scheduledAt: schema.scheduledSession.scheduledAt,
      meetingCode: schema.scheduledSession.meetingCode,
    })
    .from(schema.scheduledSession)
    .where(
      and(
        input.advisorUserId
          ? eq(schema.scheduledSession.advisorUserId, input.advisorUserId)
          : undefined,
        ltOrGt(schema.scheduledSession.createdAt, input.today)
      )
    )
    .orderBy(desc(schema.scheduledSession.scheduledAt));
};
