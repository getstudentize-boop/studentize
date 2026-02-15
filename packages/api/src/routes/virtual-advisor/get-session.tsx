import { z } from "zod";
import { getVirtualAdvisorSessionById } from "@student/db";

export const GetSessionInputSchema = z.object({
  sessionId: z.string(),
});

export const getSessionRoute = async ({
  context,
  input,
}: {
  context: { user: { id: string } };
  input: z.infer<typeof GetSessionInputSchema>;
}) => {
  const session = await getVirtualAdvisorSessionById({
    sessionId: input.sessionId,
    studentUserId: context.user.id,
  });

  if (!session) {
    throw new Error("Session not found");
  }

  return {
    id: session.id,
    title: session.title,
    advisorSlug: session.advisorSlug,
    createdAt: session.createdAt,
    endedAt: session.endedAt,
    messages: session.messages.map((msg) => ({
      role: msg.role,
      text: msg.text,
      createdAt: msg.createdAt,
    })),
  };
};
