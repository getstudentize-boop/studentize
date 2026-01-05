import {
  db,
  InferSelectModel,
  InferInsertModel,
  eq,
  desc,
  and,
  count,
  asc,
} from "..";

import * as schema from "../schema";

type AdvisorSelect = InferSelectModel<typeof schema.advisor>;
type AdvisorInsert = InferInsertModel<typeof schema.advisor>;

type AdvisorChatMessageSelect = InferSelectModel<
  typeof schema.advisorChatMessage
>;

type AdvisorChatMessageToolSelect = InferSelectModel<
  typeof schema.advisorChatMessageTool
>;

export const createBaseAdvisor = async (data: {
  userId: string;
  universityName: string;
  courseMajor: string;
  courseMinor?: string;
}) => {
  const advisor = await db
    .insert(schema.advisor)
    .values({
      userId: data.userId,
      universityName: data.universityName,
      courseMajor: data.courseMajor,
      courseMinor: data.courseMinor,
    })
    .returning({ id: schema.advisor.id });

  return advisor;
};

export const getAdvisors = async () => {
  const advisors = await db
    .select({
      advisorId: schema.advisor.id,
      userId: schema.user.id,
      email: schema.user.email,
      name: schema.user.name,
      status: schema.user.status,
      universityName: schema.advisor.universityName,
      courseMajor: schema.advisor.courseMajor,
      courseMinor: schema.advisor.courseMinor,
    })
    .from(schema.user)
    .leftJoin(schema.advisor, eq(schema.user.id, schema.advisor.userId))
    .where(eq(schema.user.type, "ADVISOR"));

  return advisors;
};

export const getAdvisorByUserId = async (userId: string) => {
  const [advisor] = await db
    .select({
      advisorId: schema.advisor.id,
      userId: schema.user.id,
      email: schema.user.email,
      name: schema.user.name,
      status: schema.user.status,
      universityName: schema.advisor.universityName,
      courseMajor: schema.advisor.courseMajor,
      courseMinor: schema.advisor.courseMinor,
    })
    .from(schema.advisor)
    .innerJoin(schema.user, eq(schema.advisor.userId, schema.user.id))
    .where(eq(schema.advisor.userId, userId));

  return advisor as typeof advisor | undefined;
};

export const getAdvisorStudentAccessList = async (advisorUserId: string) => {
  const accessList = await db
    .select({
      studentUserId: schema.advisorStudentAccess.studentUserId,
    })
    .from(schema.advisorStudentAccess)
    .where(eq(schema.advisorStudentAccess.advisorUserId, advisorUserId));

  return accessList;
};

export const createAdvisorChat = async (input: {
  chatId: string;
  title: string;
  userId: string;
  studentId: string;
}) => {
  const [chat] = await db
    .insert(schema.advisorChat)
    .values({
      id: input.chatId,
      studentId: input.studentId,
      title: input.title,
      userId: input.userId,
    })
    .returning({
      id: schema.advisorChat.id,
    });

  return chat;
};

export const createAdvisorChatMessage = async (input: {
  content: string;
  role: "user" | "assistant";
  chatId: string;
}) => {
  const [message] = await db
    .insert(schema.advisorChatMessage)
    .values({
      content: input.content,
      role: input.role,
      chatId: input.chatId,
    })
    .returning({
      id: schema.advisorChatMessage.id,
    });

  return message;
};

export const createAdvisorChatMessageTools = async (
  input: Array<{
    messageId: string;
    toolCallId: string;
    toolName: string;
    input: Record<string, any>;
    output: Record<string, any>;
  }>
) => {
  const tools = await db
    .insert(schema.advisorChatMessageTool)
    .values(input)
    .returning({
      id: schema.advisorChatMessageTool.id,
    });

  return tools;
};

export const getAdvisorChatHistory = async (input: {
  advisorUserId: string;
  studentUserId: string;
}) => {
  const chats = await db
    .select({
      id: schema.advisorChat.id,
      title: schema.advisorChat.title,
      createdAt: schema.advisorChat.createdAt,
      studentUserId: schema.advisorChat.studentId,
    })
    .from(schema.advisorChat)
    .innerJoin(
      schema.student,
      eq(schema.advisorChat.studentId, schema.student.userId)
    )
    .where(
      and(
        eq(schema.advisorChat.userId, input.advisorUserId),
        eq(schema.student.userId, input.studentUserId)
      )
    )
    .orderBy(desc(schema.advisorChat.createdAt));

  return chats;
};

export const getAdvisorChatTitle = async (input: {
  chatId: string;
  userId?: string;
}) => {
  const [chat] = await db
    .select({
      title: schema.advisorChat.title,
    })
    .from(schema.advisorChat)
    .where(
      and(
        eq(schema.advisorChat.id, input.chatId),
        input.userId ? eq(schema.advisorChat.userId, input.userId) : undefined
      )
    );

  return chat;
};

export const getAdvisorChatMessages = async (input: {
  chatId: string;
  userId: string;
}) => {
  const messages = await db
    .select({
      id: schema.advisorChatMessage.id,
      content: schema.advisorChatMessage.content,
      role: schema.advisorChatMessage.role,
      createdAt: schema.advisorChatMessage.createdAt,
    })
    .from(schema.advisorChatMessage)
    .where(eq(schema.advisorChatMessage.chatId, input.chatId));

  // todo: for some reason the subquery way of fetching tools isn't working,
  // the tools field is coming back as null, so doing it manually for now
  const messageList = await Promise.all(
    messages.map(async (m) => {
      const tool = await db
        .select()
        .from(schema.advisorChatMessageTool)
        .where(eq(schema.advisorChatMessageTool.messageId, m.id))
        .orderBy(desc(schema.advisorChatMessageTool.createdAt));

      return { ...m, tools: tool };
    })
  );

  return messageList;
};

export const getAdvisorChatMessageToolByMessageId = async (input: {
  messageId: string;
}) => {
  const tools = await db
    .select()
    .from(schema.advisorChatMessageTool)
    .where(eq(schema.advisorChatMessageTool.messageId, input.messageId))
    .orderBy(desc(schema.advisorChatMessageTool.createdAt));

  return tools;
};

export const getAdvisorStudentAccess = async (advisorUserId: string) => {
  const accessList = await db
    .select({
      studentUserId: schema.advisorStudentAccess.studentUserId,
      name: schema.user.name,
      email: schema.user.email,
    })
    .from(schema.advisorStudentAccess)
    .innerJoin(
      schema.user,
      eq(schema.advisorStudentAccess.studentUserId, schema.user.id)
    )
    .where(eq(schema.advisorStudentAccess.advisorUserId, advisorUserId));

  return accessList;
};

export const updateAdvisorStudentAccess = async (
  advisorUserId: string,
  studentUserIds: string[]
) => {
  // First, remove all existing access for this advisor
  await db
    .delete(schema.advisorStudentAccess)
    .where(eq(schema.advisorStudentAccess.advisorUserId, advisorUserId));

  // Then, add the new access list
  if (studentUserIds.length > 0) {
    await db.insert(schema.advisorStudentAccess).values(
      studentUserIds.map((studentUserId) => ({
        advisorUserId,
        studentUserId,
      }))
    );
  }

  return { success: true };
};

export const getOneStudentAccess = async (data: {
  advisorUserId: string;
  studentUserId: string;
}) => {
  const studentAccess = await db.query.advisorStudentAccess.findFirst({
    where:
      eq(schema.advisorStudentAccess.advisorUserId, data.advisorUserId) &&
      eq(schema.advisorStudentAccess.studentUserId, data.studentUserId),
  });

  return studentAccess;
};

export const getOverviewByUserId = async (input: { advisorUserId: string }) => {
  const [advisor] = await db
    .select({
      id: schema.advisor.id,
      createdAt: schema.advisor.createdAt,
      university: schema.advisor.universityName,
      courseMajor: schema.advisor.courseMajor,
      user: {
        name: schema.user.name,
        email: schema.user.email,
      },
    })
    .from(schema.advisor)
    .innerJoin(schema.user, eq(schema.user.id, schema.advisor.userId))
    .where(eq(schema.advisor.userId, input.advisorUserId));

  return advisor;
};

export const getOverviewStats = async (input: { advisorUserId?: string }) => {
  const [students] = await db
    .select({ count: count() })
    .from(schema.advisorStudentAccess)
    .where(
      input.advisorUserId
        ? eq(schema.advisorStudentAccess.advisorUserId, input.advisorUserId)
        : undefined
    );

  const [sessions] = await db
    .select({ count: count() })
    .from(schema.session)
    .where(
      input.advisorUserId
        ? eq(schema.session.advisorUserId, input.advisorUserId)
        : undefined
    );

  return { totalStudents: students.count, totalSessions: sessions.count };
};

export const getStudentList = async (input: { advisorUserId?: string }) => {
  if (!input.advisorUserId) {
    return db
      .select({
        studentUserId: schema.user.id,
        name: schema.user.name,
        curriculum: schema.student.studyCurriculum,
        status: schema.student.status,
      })
      .from(schema.student)
      .innerJoin(schema.user, eq(schema.user.id, schema.student.userId))
      .orderBy(asc(schema.student.status));
  }

  return db
    .select({
      studentUserId: schema.advisorStudentAccess.studentUserId,
      name: schema.user.name,
      curriculum: schema.student.studyCurriculum,
      status: schema.student.status,
    })
    .from(schema.advisorStudentAccess)
    .innerJoin(
      schema.user,
      eq(schema.user.id, schema.advisorStudentAccess.studentUserId)
    )
    .innerJoin(
      schema.student,
      eq(schema.student.userId, schema.advisorStudentAccess.studentUserId)
    )
    .where(eq(schema.advisorStudentAccess.advisorUserId, input.advisorUserId));
};
