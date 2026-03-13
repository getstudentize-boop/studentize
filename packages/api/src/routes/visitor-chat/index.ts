import { type } from "@orpc/server";
import { createId } from "@student/db";

import { visitorChat, VisitorChatInput } from "./chat";
import { serverRoute } from "../../utils/middleware";

export const visitorChatHandler = serverRoute
  .input(type<VisitorChatInput>())
  .handler(async ({ input }) => {
    return await visitorChat(input);
  });

export const visitorChatNewIdHandler = serverRoute.handler(async () => {
  return createId();
});
