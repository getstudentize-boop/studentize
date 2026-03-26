import { AuthContext } from "@/utils/middleware";
import z from "zod";

import { updateStudentByUserId, updateUserName } from "@student/db";

export const UpdateMyProfileInputSchema = z.object({
  name: z.string().min(1).optional(),
  studyCurriculum: z.string().optional(),
  expectedGraduationYear: z.string().optional(),
  targetCountries: z.array(z.string()).optional(),
  areasOfInterest: z.array(z.string()).optional(),
  location: z.string().optional(),
});

export const updateMyProfile = async (
  ctx: AuthContext,
  input: z.infer<typeof UpdateMyProfileInputSchema>
) => {
  const userId = ctx.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { name, ...studentData } = input;

  // Update user name if provided
  if (name !== undefined) {
    await updateUserName(userId, name);
  }

  // Update student data if any fields provided
  const hasStudentData = Object.values(studentData).some(
    (value) => value !== undefined
  );

  if (hasStudentData) {
    await updateStudentByUserId(userId, {
      studyCurriculum: studentData.studyCurriculum,
      expectedGraduationYear: studentData.expectedGraduationYear,
      targetCountries: studentData.targetCountries,
      areasOfInterest: studentData.areasOfInterest,
      location: studentData.location,
    });
  }

  return { success: true };
};
