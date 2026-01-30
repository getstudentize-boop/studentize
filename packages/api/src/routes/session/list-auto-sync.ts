import { createRouteHelper } from "../../utils/middleware";
import { getAutoSyncedSessions } from "@student/db";
import { ORPCError } from "@orpc/server";

export const listAutoSyncSessionsRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    if (!["OWNER", "ADMIN"].includes(ctx.user.organization.role)) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const sessions = await getAutoSyncedSessions();
    return sessions;
  },
});
