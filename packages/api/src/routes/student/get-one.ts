import { AuthContext } from "@/utils/middleware";
import { getStudentByUserId } from "@student/db";
import z from "zod";

export const GetOneStudentInputSchema = z.object({
  userId: z.string(),
});

export const getOneStudent = async (
  ctx: AuthContext,
  input: z.infer<typeof GetOneStudentInputSchema>
) => {
  const student = await getStudentByUserId(input.userId);
  return student;
};
