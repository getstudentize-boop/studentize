import { type } from "@orpc/server";
import { listVisitorChats, getVisitorChatMessages } from "@student/db";
import z from "zod";

import { visitorChat, VisitorChatInput } from "./chat";
import { serverRoute, privateRoute } from "../../utils/middleware";

export const visitorChatHandler = serverRoute
  .input(type<VisitorChatInput>())
  .handler(async ({ input }) => {
    return await visitorChat(input);
  });

export const visitorChatListHandler = privateRoute.handler(async () => {
  return await listVisitorChats();
});

export const visitorChatMessagesHandler = privateRoute
  .input(z.object({ chatId: z.string() }))
  .handler(async ({ input }) => {
    return await getVisitorChatMessages({ chatId: input.chatId });
  });
