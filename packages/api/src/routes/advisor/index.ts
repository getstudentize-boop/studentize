import { privateRoute } from "../../utils/middleware";

import { createAdvisor, CreateAdvisorInputSchema } from "./create";
import { listAdvisors } from "./lists";
import { searchAdvisors, SearchAdvisorsInputSchema } from "./search";
import { getOneAdvisor, GetOneAdvisorInputSchema } from "./get-one";
import { updateAdvisor, UpdateAdvisorInputSchema } from "./update";
import {
  getAdvisorStudentAccessList,
  updateAdvisorStudentAccessList,
  GetAdvisorStudentAccessInputSchema,
  UpdateAdvisorStudentAccessInputSchema,
} from "./student-access";
import {
  advisorChatHistoryRoute,
  AdvisorChatHistoryInputSchema,
} from "./chat-history";
import { chatMessages, ChatMessagesInputSchema } from "./chat-messages";

import { getOverviewRoute } from "./get-overview";
import { getStudentListRoute } from "./student-list";
import {
  getScheduledSessionsRoute,
  GetScheduledSessionsInputSchema,
} from "./get-scheduled-sessions";

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
  .handler(async ({ input, context }) => {
    const advisors = await searchAdvisors(context, input);
    return advisors;
  });

export const advisorChatMessagesHandler = privateRoute
  .input(ChatMessagesInputSchema)
  .handler(async ({ context, input }) => {
    const chat = await chatMessages(context, input);
    return chat;
  });

export const advisorGetOneHandler = privateRoute
  .input(GetOneAdvisorInputSchema)
  .handler(async ({ input, context }) => {
    const advisor = await getOneAdvisor(context, input);
    return advisor;
  });

export const advisorUpdateHandler = privateRoute
  .input(UpdateAdvisorInputSchema)
  .handler(async ({ input }) => {
    const result = await updateAdvisor(input);
    return result;
  });

export const advisorStudentAccessGetHandler = privateRoute
  .input(GetAdvisorStudentAccessInputSchema)
  .handler(async ({ input }) => {
    const result = await getAdvisorStudentAccessList(input);
    return result;
  });

export const advisorStudentAccessUpdateHandler = privateRoute
  .input(UpdateAdvisorStudentAccessInputSchema)
  .handler(async ({ input }) => {
    const result = await updateAdvisorStudentAccessList(input);
    return result;
  });

// todo: move all the routes above to this format.
export const advisor = {
  getOverview: privateRoute.handler(getOverviewRoute),
  getStudentList: privateRoute.handler(getStudentListRoute),
  getScheduledSessions: privateRoute
    .input(GetScheduledSessionsInputSchema)
    .handler(getScheduledSessionsRoute),
  chatHistory: privateRoute
    .input(AdvisorChatHistoryInputSchema)
    .handler(advisorChatHistoryRoute),
};
