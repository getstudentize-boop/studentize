import { os } from "@orpc/server";

import { createAdvisor, CreateAdvisorInputSchema } from "./create";
import { listAdvisors } from "./lists";
import { searchAdvisors, SearchAdvisorsInputSchema } from "./search";
import { advisorChatHistory } from "./chat-history";
import { chatMessages, ChatMessagesInputSchema } from "./chat-messages";

import { defaultMiddleware } from "../../utils/middleware";

export const advisorCreateHandler = os
  .use(defaultMiddleware)
  .input(CreateAdvisorInputSchema)
  .handler(async ({ input }) => {
    const result = await createAdvisor(input);
    return result;
  });

export const advisorListHandler = os
  .use(defaultMiddleware)
  .handler(async () => {
    const advisors = await listAdvisors();
    return advisors;
  });

export const advisorSearchHandler = os
  .use(defaultMiddleware)
  .input(SearchAdvisorsInputSchema)
  .handler(async ({ input }) => {
    const advisors = await searchAdvisors(input);
    return advisors;
  });

export const advisorChatHistoryHandler = os
  .use(defaultMiddleware)
  .handler(async () => {
    const chats = await advisorChatHistory();
    return chats;
  });

export const advisorChatMessagesHandler = os
  .use(defaultMiddleware)
  .input(ChatMessagesInputSchema)
  .handler(async ({ input }) => {
    const chat = await chatMessages(input);
    return chat;
  });
