import z from "zod";
import { createRouteHelper } from "../../utils/middleware";
import { getAdvisorChatHistory } from "@student/db";

export const AdvisorChatHistoryInputSchema = z.object({
  studentUserId: z.string(),
});

export const advisorChatHistoryRoute = createRouteHelper({
  inputSchema: AdvisorChatHistoryInputSchema,
  execute: async ({ input, ctx }) => {
    const advisorUserId = ctx.user.id;

    const chats = await getAdvisorChatHistory({
      advisorUserId,
      studentUserId: input.studentUserId,
    });

    return chats;
  },
});
