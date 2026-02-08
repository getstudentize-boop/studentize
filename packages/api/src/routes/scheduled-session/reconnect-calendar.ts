import { ORPCError } from "@orpc/server";
import { createRouteHelper } from "../../utils/middleware";
import { deleteCalendarByUserId } from "@student/db";
import { Oauth } from "./authenticate";

export const reconnectCalendarRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    if (!["OWNER", "ADMIN"].includes(ctx.user.organization.role)) {
      throw new ORPCError("FORBIDDEN", { message: "Access denied" });
    }

    // Delete existing calendar record
    await deleteCalendarByUserId({ userId: ctx.user.id });

    // Return OAuth URL for reauthentication
    return Oauth({ userId: ctx.user.id });
  },
});
