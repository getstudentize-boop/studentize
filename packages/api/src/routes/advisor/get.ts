import { z } from "zod";
import { getAdvisors } from "@student/db";

export const GetOneAdvisorInputSchema = z.object({
  userId: z.string(),
});

export const getOneAdvisor = async (
  data: z.infer<typeof GetOneAdvisorInputSchema>
) => {
  const advisors = await getAdvisors();
  const advisor = advisors.find((a) => a.userId === data.userId);

  if (!advisor) {
    throw new Error("Advisor not found");
  }

  return advisor;
};
