import { createRouteHelper } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";
import { getScheduledSessionList } from "@student/db";

export const listScheduledSessionsRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    if (ctx.user.type !== "ADMIN") {
      throw new ORPCError("UNAUTHORIZED");
    }

    const scheduledSession = await getScheduledSessionList();
    return scheduledSession;
  },
});
