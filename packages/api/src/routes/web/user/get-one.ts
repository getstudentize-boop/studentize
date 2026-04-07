import { getUserById } from "@student/db";
import z from "zod";

export const GetOneUserInputSchema = z.object({
  userId: z.string(),
});

export const getOneUser = async (
  input: z.infer<typeof GetOneUserInputSchema>
) => {
  const user = await getUserById({ userId: input.userId });
  return user;
};
