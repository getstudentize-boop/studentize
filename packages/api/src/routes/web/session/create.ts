import z from "zod";

import { createSession as createSessionDb } from "@student/db";

export const CreateSessionInputSchema = z.object({
  studentUserId: z.string(),
  advisorUserId: z.string(),
  title: z.string().min(1),
});

export const createSession = async (
  data: z.infer<typeof CreateSessionInputSchema>
) => {
  const session = await createSessionDb(data);
  return session;
};
