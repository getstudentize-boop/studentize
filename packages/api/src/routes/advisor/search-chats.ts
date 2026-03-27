import z from "zod";
import { createRouteHelper } from "../../utils/middleware";
import { searchChatHistory } from "@student/db";

export const SearchChatsInputSchema = z.object({
  studentUserId: z.string().optional(),
  query: z.string(),
});

export const searchChatsRoute = createRouteHelper({
  inputSchema: SearchChatsInputSchema,
  execute: async ({ input, ctx }) => {
    const isStudent = ctx.user.organization.role === "STUDENT";

    const chats = await searchChatHistory({
      userId: ctx.user.id,
      studentUserId: isStudent ? undefined : input.studentUserId,
      query: input.query,
      isStudent,
    });

    return chats;
  },
});
