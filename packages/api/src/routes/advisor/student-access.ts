import { z } from "zod";
import {
  getAdvisorStudentAccess,
  updateAdvisorStudentAccess,
} from "@student/db";

export const GetAdvisorStudentAccessInputSchema = z.object({
  advisorId: z.string(),
});

export const UpdateAdvisorStudentAccessInputSchema = z.object({
  advisorId: z.string(),
  studentIds: z.array(z.string()),
});

export const getAdvisorStudentAccessList = (
  data: z.infer<typeof GetAdvisorStudentAccessInputSchema>
) => {
  return getAdvisorStudentAccess(data.advisorId);
};

export const updateAdvisorStudentAccessList = (
  data: z.infer<typeof UpdateAdvisorStudentAccessInputSchema>
) => {
  return updateAdvisorStudentAccess(data.advisorId, data.studentIds);
};
