import { updateSessionById } from "@student/db";
import z from "zod";

export const UpdateSessionInputSchema = z.object({
  sessionId: z.string(),
  createdAt: z.date(),
});

export const updateSession = async (
  input: z.infer<typeof UpdateSessionInputSchema>
) => {
  await updateSessionById({
    sessionId: input.sessionId,
    createdAt: input.createdAt,
  });

  return { success: true };
};
