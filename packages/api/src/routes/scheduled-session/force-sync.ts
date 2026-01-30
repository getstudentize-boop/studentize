import { createRouteHelper } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";
import { syncScheduledSessionsRoute } from "../admin/sync";

export const forcSyncScheduledSessionRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    if (!["OWNER", "ADMIN"].includes(ctx.user.organization.role)) {
      throw new ORPCError("UNAUTHORIZED");
    }

    await syncScheduledSessionsRoute({ input: {} });
  },
});
