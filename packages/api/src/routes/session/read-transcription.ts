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
  if (!["ADMIN", "ADVISOR"].includes(ctx.user.type)) {
    throw new ORPCError("UNAUTHORIZED");
  }

  const session = await getSessionById({ sessionId: input.sessionId });

  if (!session) {
    throw new ORPCError("NOT_FOUND", { message: "Session not found" });
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
