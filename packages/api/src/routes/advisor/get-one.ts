import { z } from "zod";
import { getAdvisorByUserId, getAdvisorStudentAccessList } from "@student/db";
import { ORPCError } from "@orpc/server";
import { AuthContext } from "@/utils/middleware";

export const GetOneAdvisorInputSchema = z.object({
  userId: z.string(),
});

export const getOneAdvisor = async (
  ctx: AuthContext,
  data: z.infer<typeof GetOneAdvisorInputSchema>
) => {
  if (ctx.user.type !== "ADMIN" && ctx.user.id !== data.userId) {
    throw new ORPCError("FORBIDDEN");
  }

  const advisor = await getAdvisorByUserId(data.userId);

  if (!advisor) {
    throw new ORPCError("NOT_FOUND");
  }

  const studentAccess = await getAdvisorStudentAccessList(data.userId);

  return {
    ...advisor,
    studentIds: studentAccess.map((access) => ({
      userId: access.studentUserId,
    })),
  };
};
