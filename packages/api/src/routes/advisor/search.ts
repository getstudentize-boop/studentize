import z from "zod";

import { getAdvisorByUserId, searchUserByName } from "@student/db";
import { AuthContext } from "@/utils/middleware";
import { ORPCError } from "@orpc/server";

export const SearchAdvisorsInputSchema = z.object({
  query: z.string(),
});

export const searchAdvisors = async (
  ctx: AuthContext,
  input: z.infer<typeof SearchAdvisorsInputSchema>
) => {
  const isAdmin = ["OWNER", "ADMIN"].includes(ctx.user.organization.role);

  if (isAdmin) {
    const advisors = await searchUserByName({
      query: input.query,
      role: "ADVISOR",
      organizationId: ctx.organizationId,
    });

    return advisors;
  } else if (ctx.user.organization.role === "ADVISOR") {
    const advisor = await getAdvisorByUserId(ctx.user.id);

    if (!advisor) {
      throw new ORPCError("BAD_REQUEST");
    }

    return [{ userId: advisor.userId, name: advisor.name }];
  }

  throw new ORPCError("FORBIDDEN");
};
