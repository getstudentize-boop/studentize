import { eq } from "drizzle-orm";
import { db } from "..";
import * as schema from "../schema";

export const createVisitorChat = async (data: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}) => {
  const [row] = await db
    .insert(schema.visitorChat)
    .values({
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
    })
    .returning({ id: schema.visitorChat.id });

  return row!;
};

export const updateVisitorChatTitle = async (data: {
  chatId: string;
  title: string;
}) => {
  await db
    .update(schema.visitorChat)
    .set({ title: data.title })
    .where(eq(schema.visitorChat.id, data.chatId));
};

export const createVisitorChatMessage = async (data: {
  chatId: string;
  role: "user" | "assistant";
  content: string;
}) => {
  const [row] = await db
    .insert(schema.visitorChatMessage)
    .values({
      chatId: data.chatId,
      role: data.role,
      content: data.content,
    })
    .returning({ id: schema.visitorChatMessage.id });

  return row!;
};

export const getVisitorChatMessages = async (data: { chatId: string }) => {
  return db
    .select()
    .from(schema.visitorChatMessage)
    .where(eq(schema.visitorChatMessage.chatId, data.chatId))
    .orderBy(schema.visitorChatMessage.createdAt);
};
