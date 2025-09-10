import { db, InferSelectModel, InferInsertModel, eq, desc } from "..";

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
    .from(schema.advisor)
    .innerJoin(schema.user, eq(schema.advisor.userId, schema.user.id));

  return advisors;
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

export const getAdvisorChatHistory = async () => {
  // todo-before-review: filter by advisor id
  const chats = await db
    .select({
      id: schema.advisorChat.id,
      title: schema.advisorChat.title,
      createdAt: schema.advisorChat.createdAt,
      studentUserId: schema.advisorChat.studentId,
    })
    .from(schema.advisorChat)
    .orderBy(desc(schema.advisorChat.createdAt));

  return chats;
};

export const getAdvisorChatTitle = async (chatId: string) => {
  const [chat] = await db
    .select({
      title: schema.advisorChat.title,
    })
    .from(schema.advisorChat)
    .where(eq(schema.advisorChat.id, chatId));

  return chat;
};

export const getAdvisorChatMessages = async (chatId: string) => {
  const messages = await db
    .select({
      id: schema.advisorChatMessage.id,
      content: schema.advisorChatMessage.content,
      role: schema.advisorChatMessage.role,
      createdAt: schema.advisorChatMessage.createdAt,
    })
    .from(schema.advisorChatMessage)
    .where(eq(schema.advisorChatMessage.chatId, chatId));

  return messages;
};
