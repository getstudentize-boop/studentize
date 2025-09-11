import { z } from "zod";
import { getAdvisorByUserId, getAdvisorStudentAccessList } from "@student/db";
import { ORPCError } from "@orpc/server";

export const GetOneAdvisorInputSchema = z.object({
  userId: z.string(),
});

export const getOneAdvisor = async (
  data: z.infer<typeof GetOneAdvisorInputSchema>
) => {
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
