import { db, InferSelectModel, InferInsertModel, eq, desc, and } from "..";

import * as schema from "../schema";
import { createdAt } from "../schema/utils";

type AdvisorSelect = InferSelectModel<typeof schema.advisor>;
type AdvisorInsert = InferInsertModel<typeof schema.advisor>;

type AdvisorChatMessage = InferSelectModel<typeof schema.advisorChatMessage>;

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

export const getAdvisorChatHistory = async (input: {
  advisorUserId: string;
}) => {
  const chats = await db
    .select({
      id: schema.advisorChat.id,
      title: schema.advisorChat.title,
      createdAt: schema.advisorChat.createdAt,
      studentUserId: schema.advisorChat.studentId,
    })
    .from(schema.advisorChat)
    .where(eq(schema.advisorChat.userId, input.advisorUserId))
    .orderBy(desc(schema.advisorChat.createdAt));

  return chats;
};

export const getAdvisorChatTitle = async (input: {
  chatId: string;
  userId: string;
}) => {
  const [chat] = await db
    .select({
      title: schema.advisorChat.title,
    })
    .from(schema.advisorChat)
    .where(
      and(
        eq(schema.advisorChat.id, input.chatId),
        eq(schema.advisorChat.userId, input.userId)
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

  return messages;
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
