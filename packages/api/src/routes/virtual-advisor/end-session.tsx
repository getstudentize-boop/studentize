import { z } from "zod";
import { updateVirtualAdvisorSession, getVirtualAdvisorSessionById } from "@student/db";

export const EndSessionInputSchema = z.object({
  sessionId: z.string(),
});

export const endSessionRoute = async ({
  context,
  input,
}: {
  context: { user: { id: string } };
  input: z.infer<typeof EndSessionInputSchema>;
}) => {
    const session = await getVirtualAdvisorSessionById({
      sessionId: input.sessionId,
      studentUserId: context.user.id,
    });

    if (!session) {
      throw new Error("Session not found");
    }

    await updateVirtualAdvisorSession({
      sessionId: input.sessionId,
      endedAt: new Date(),
    });

    return { success: true };
};
