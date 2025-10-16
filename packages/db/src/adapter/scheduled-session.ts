import { db, schema } from "..";

export const createScheduleSession = async ({
  scheduledAt,
  advisorUserId,
  studentUserId,
  meetingLink,
  title,
}: {
  scheduledAt: Date;
  advisorUserId: string;
  studentUserId: string;
  meetingLink: string;
  title: string;
}) => {
  const [session] = await db
    .insert(schema.scheduledSession)
    .values({
      scheduledAt,
      advisorUserId,
      studentUserId,
      meetingLink,
      title,
    })
    .returning({ id: schema.scheduledSession.id });

  return { scheduledSessionId: session.id };
};

// todo assume its an admin
export const getScheduledSessionList = async () => {
  return db.query.scheduledSession.findMany({
    columns: {
      advisorUserId: true,
      studentUserId: true,
      scheduledAt: true,
      meetingLink: true,
      id: true,
    },
  });
};
