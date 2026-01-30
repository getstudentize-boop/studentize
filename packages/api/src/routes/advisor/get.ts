import { z } from "zod";
import { getAdvisors } from "@student/db";
import { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const GetOneAdvisorInputSchema = z.object({
  userId: z.string(),
});

export const getOneAdvisor = async (
  ctx: AuthContext,
  data: z.infer<typeof GetOneAdvisorInputSchema>
) => {
  const advisors = await getAdvisors(ctx.organizationId);
  const advisor = advisors.find((a) => a.userId === data.userId);

  if (!advisor) {
    throw new ORPCError("NOT_FOUND", { message: "Advisor not found" });
  }

  return advisor;
};
