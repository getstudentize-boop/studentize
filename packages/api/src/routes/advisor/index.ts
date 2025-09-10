import { os } from "@orpc/server";

import { createAdvisor, CreateAdvisorInputSchema } from "./create";
import { listAdvisors } from "./lists";
import { searchAdvisors, SearchAdvisorsInputSchema } from "./search";
import { getOneAdvisor, GetOneAdvisorInputSchema } from "./get-one";
import { updateAdvisor, UpdateAdvisorInputSchema } from "./update";
import { advisorChatHistory } from "./chat-history";
import { chatMessages, ChatMessagesInputSchema } from "./chat-messages";

import { privateRoute } from "../../utils/middleware";

export const advisorCreateHandler = privateRoute
  .input(CreateAdvisorInputSchema)
  .handler(async ({ input }) => {
    const result = await createAdvisor(input);
    return result;
  });

export const advisorListHandler = privateRoute.handler(async () => {
  const advisors = await listAdvisors();
  return advisors;
});

export const advisorSearchHandler = privateRoute
  .input(SearchAdvisorsInputSchema)
  .handler(async ({ input }) => {
    const advisors = await searchAdvisors(input);
    return advisors;
  });

export const advisorChatHistoryHandler = privateRoute.handler(async () => {
  const chats = await advisorChatHistory();
  return chats;
});

export const advisorChatMessagesHandler = privateRoute
  .input(ChatMessagesInputSchema)
  .handler(async ({ input }) => {
    const chat = await chatMessages(input);
    return chat;
  });

export const advisorGetOneHandler = privateRoute
  .input(GetOneAdvisorInputSchema)
  .handler(async ({ input }) => {
    const advisor = await getOneAdvisor(input);
    return advisor;
  });

export const advisorUpdateHandler = privateRoute
  .input(UpdateAdvisorInputSchema)
  .handler(async ({ input }) => {
    const result = await updateAdvisor(input);
    return result;
  });
