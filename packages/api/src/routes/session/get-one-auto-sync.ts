import { createRouteHelper } from "../../utils/middleware";
import { z } from "zod";
import { ORPCError } from "@orpc/server";

import { getAutoSyncSessionById } from "@student/db";

export const GetOneAutoSyncSessionInputSchema = z.object({
  sessionId: z.string(),
});

export const getOneAutoSyncSessionRoute = createRouteHelper({
  inputSchema: GetOneAutoSyncSessionInputSchema,
  execute: async ({ input, ctx }) => {
    const isAdminOrAdvisor = ["ADMIN", "ADVISOR"].includes(ctx.user.type);

    if (!isAdminOrAdvisor) {
      throw new ORPCError("FORBIDDEN", { message: "Access denied" });
    }

    const session = await getAutoSyncSessionById({
      sessionId: input.sessionId,
    });

    return session;
  },
});
