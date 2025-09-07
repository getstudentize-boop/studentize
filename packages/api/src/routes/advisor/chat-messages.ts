import { getAdvisorChatMessages, getAdvisorChatTitle } from "@student/db";
import z from "zod";

export const ChatMessagesInputSchema = z.object({
  chatId: z.string(),
});

export const chatMessages = async (
  input: z.infer<typeof ChatMessagesInputSchema>
) => {
  const [{ title }, messages] = await Promise.all([
    getAdvisorChatTitle(input.chatId),
    getAdvisorChatMessages(input.chatId),
  ]);

  return { title, messages };
};
