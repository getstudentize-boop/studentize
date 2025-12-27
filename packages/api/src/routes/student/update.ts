import { AuthContext } from "@/utils/middleware";
import z from "zod";

import { updateStudentByUserId } from "@student/db";

export const UpdateStudentInputSchema = z.object({
  studentUserId: z.string(),
  studyCurriculum: z.string(),
  expectedGraduationYear: z.string(),
  targetCountries: z.array(z.string()),
  areasOfInterest: z.array(z.string()),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  extracurricular: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
      hoursPerWeek: z.number(),
      yearsOfExperience: z.number(),
      description: z.string().optional(),
    })
  ),
});

export const updateStudent = async (
  ctx: AuthContext,
  input: z.infer<typeof UpdateStudentInputSchema>
) => {
  const { studentUserId, ...rest } = input;

  const { studentId } = await updateStudentByUserId(studentUserId, {
    ...rest,
    expectedGraduationYear: rest.expectedGraduationYear.toString(),
    status: rest.status,
  });

  return { studentId };
};
