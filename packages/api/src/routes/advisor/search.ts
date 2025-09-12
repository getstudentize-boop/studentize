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
  if (ctx.user.type === "ADMIN") {
    const advisors = await searchUserByName({
      query: input.query,
      type: "ADVISOR",
    });

    return advisors;
  } else if (ctx.user.type === "ADVISOR") {
    const advisor = await getAdvisorByUserId(ctx.user.id);

    if (!advisor) {
      throw new ORPCError("BAD_REQUEST");
    }

    return [{ userId: advisor.userId, name: advisor.name }];
  }

  throw new ORPCError("FORBIDDEN");
};
