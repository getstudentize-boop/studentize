import { AuthContext } from "@/utils/middleware";
import { ORPCError } from "@orpc/server";
import { getAdvisorChatMessages, getAdvisorChatTitle } from "@student/db";
import z from "zod";

export const ChatMessagesInputSchema = z.object({
  chatId: z.string(),
});

export const chatMessages = async (
  ctx: AuthContext,
  input: z.infer<typeof ChatMessagesInputSchema>
) => {
  const userId = ctx.user.id;

  const chat = await getAdvisorChatTitle({
    chatId: input.chatId,
    userId: ctx.user.type === "ADMIN" ? undefined : userId,
  });

  if (!chat) {
    throw new ORPCError("NOT_FOUND", { message: "Chat not found" });
  }

  const messages = await getAdvisorChatMessages({
    chatId: input.chatId,
    userId,
  });

  return { title: chat.title, messages };
};
