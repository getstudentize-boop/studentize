import z from "zod";
import { createRouteHelper } from "../../utils/middleware";
import { getOneStudentAccess, getSessionSummaryById } from "@student/db";
import { ORPCError } from "@orpc/server";

export const GetSessionOverviewInputSchema = z.object({
  sessionId: z.string(),
});

export const getSessionOverviewRoute = createRouteHelper({
  inputSchema: GetSessionOverviewInputSchema,
  execute: async ({ input, ctx }) => {
    const session = await getSessionSummaryById({
      sessionId: input.sessionId,
    });

    if (!session) {
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }

    if (ctx.user.type === "STUDENT") {
      throw new ORPCError("UNAUTHORIZED");
    }

    if (ctx.user.type === "ADVISOR") {
      const access = await getOneStudentAccess({
        advisorUserId: ctx.user.id,
        studentUserId: session?.studentUserId ?? "",
      });

      if (!access && !session?.studentUserId) {
        throw new ORPCError("UNAUTHORIZED");
      }
    }

    return session;
  },
});
