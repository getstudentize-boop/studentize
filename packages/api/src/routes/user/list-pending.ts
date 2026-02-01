import { getPendingUsers } from "@student/db";
import { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const listPendingUsers = async (ctx: AuthContext) => {
  const isAdmin = ["OWNER", "ADMIN"].includes(ctx.user.organization.role);

  if (!isAdmin) {
    throw new ORPCError("FORBIDDEN", {
      message: "Admin access required",
    });
  }

  const users = await getPendingUsers(ctx.organizationId);
  return users;
};
