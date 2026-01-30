import { AuthContext } from "@/utils/middleware";
import { ORPCError } from "@orpc/server";
import { getSessionById } from "@student/db";
import z from "zod";

export const SummarizeTranscriptionInputSchema = z.object({
  sessionId: z.string(),
});

export const authenticateSession = async (
  ctx: AuthContext,
  input: { sessionId: string }
) => {
  const isAdminOrAdvisor = ["OWNER", "ADMIN", "ADVISOR"].includes(
    ctx.user.organization.role
  );

  if (!isAdminOrAdvisor) {
    throw new ORPCError("FORBIDDEN", { message: "Access denied" });
  }

  const session = await getSessionById({ sessionId: input.sessionId });

  if (ctx.user.organization.role === "ADVISOR") {
    const advisorUserId = ctx.user.id;

    if (advisorUserId !== session?.advisorUserId) {
      throw new ORPCError("FORBIDDEN", { message: "Access denied" });
    }
  }

  if (!session) {
    throw new ORPCError("NOT_FOUND", { message: "Session not found" });
  }

  return session;
};
