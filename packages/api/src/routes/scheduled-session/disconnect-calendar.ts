import { ORPCError } from "@orpc/server";
import { createRouteHelper } from "../../utils/middleware";
import { deleteCalendarByUserId } from "@student/db";

export const disconnectCalendarRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    if (!["OWNER", "ADMIN"].includes(ctx.user.organization.role)) {
      throw new ORPCError("FORBIDDEN", { message: "Access denied" });
    }

    await deleteCalendarByUserId({ userId: ctx.user.id });

    return { success: true };
  },
});
