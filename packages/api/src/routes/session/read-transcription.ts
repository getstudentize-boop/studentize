import { AuthContext } from "../../utils/middleware";
import { createTranscriptionObjectKey, readFile } from "../../utils/s3";
import { ORPCError } from "@orpc/server";
import { getSessionById } from "@student/db";
import z from "zod";

export const ReadSessionTranscriptionInputSchema = z.object({
  sessionId: z.string(),
});

export const readSessionTranscription = async (
  ctx: AuthContext,
  input: z.infer<typeof ReadSessionTranscriptionInputSchema>
) => {
  const session = await getSessionById({ sessionId: input.sessionId });

  if (!session || !session?.studentUserId) {
    throw new ORPCError("NOT_FOUND", { message: "Session not found" });
  }

  // Allow owners, admins, advisors, and the student who owns the session
  const isStudent = ctx.user.organization.role === "STUDENT" && ctx.user.id === session.studentUserId;
  const isAdminOrAdvisor = ["OWNER", "ADMIN", "ADVISOR"].includes(ctx.user.organization.role);

  if (!isStudent && !isAdminOrAdvisor) {
    throw new ORPCError("UNAUTHORIZED", { message: "You don't have permission to view this session" });
  }

  const content = await readFile({
    bucket: "transcription",
    key: createTranscriptionObjectKey({
      ext: "txt",
      sessionId: input.sessionId,
      studentUserId: session.studentUserId,
    }),
  });

  return { content };
};
