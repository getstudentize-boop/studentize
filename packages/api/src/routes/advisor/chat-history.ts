import z from "zod";
import { createRouteHelper } from "../../utils/middleware";
import { getAdvisorChatHistory, getStudentChatHistory } from "@student/db";

export const AdvisorChatHistoryInputSchema = z.object({
  studentUserId: z.string().optional(),
});

export const advisorChatHistoryRoute = createRouteHelper({
  inputSchema: AdvisorChatHistoryInputSchema,
  execute: async ({ input, ctx }) => {
    if (ctx.user.type === "STUDENT") {
      const chats = await getStudentChatHistory({
        studentUserId: ctx.user.id,
      });

      return chats;
    }

    const chats = await getAdvisorChatHistory({
      advisorUserId: ctx.user.id,
      studentUserId: input.studentUserId!,
    });

    return chats;
  },
});
