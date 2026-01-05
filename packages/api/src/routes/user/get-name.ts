import { getUserName } from "@student/db";
import z from "zod";

export const GetUserNameInputSchema = z.object({
  userId: z.string(),
});

export const getUserNameData = async (
  input: z.infer<typeof GetUserNameInputSchema>
) => {
  const user = await getUserName({ userId: input.userId });
  return user;
};
