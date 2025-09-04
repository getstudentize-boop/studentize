import z from "zod";

import { createSession as createSessionDb } from "@student/db";

export const CreateSessionInputSchema = z.object({
  studentId: z.string(),
  advisorId: z.string(),
  title: z.string().min(1),
});

export const createSession = (
  data: z.infer<typeof CreateSessionInputSchema>
) => {
  const session = createSessionDb(data);
  return session;
};
