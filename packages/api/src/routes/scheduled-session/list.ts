import { createRouteHelper } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";
import { getScheduledSessionList } from "@student/db";

export const listScheduledSessionsRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    if (!["OWNER", "ADMIN"].includes(ctx.user.organization.role)) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const scheduledSession = await getScheduledSessionList(ctx.organizationId);
    return scheduledSession;
  },
});
