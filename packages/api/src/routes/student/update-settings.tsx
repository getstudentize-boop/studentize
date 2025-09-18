import { AuthContext } from "@/utils/middleware";
import { updateStudentByUserId, updateUserEmail } from "@student/db";
import z from "zod";

export const StudentUpdateSettingsInputSchema = z.object({
  location: z.string(),
  email: z.email(),
  userId: z.string(),
});

export const updateSettings = async (
  ctx: AuthContext,
  input: z.infer<typeof StudentUpdateSettingsInputSchema>
) => {
  if (ctx.user.type !== "ADMIN") {
    return { success: false };
  }

  const userId = input.userId;

  await updateUserEmail(userId, { email: input.email });
  await updateStudentByUserId(userId, { location: input.location });

  return { success: true };
};
