import z from "zod";

import { getUserName } from "@student/db";

export const UserDisplayInputSchema = z.object({
  userId: z.string(),
});

export const getUserDisplay = async (
  data: z.infer<typeof UserDisplayInputSchema>
) => {
  const user = await getUserName(data.userId);
  return user;
};
