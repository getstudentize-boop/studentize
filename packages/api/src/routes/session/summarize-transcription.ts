import { AuthContext } from "@/utils/middleware";
import { ORPCError } from "@orpc/server";
import { getSessionById, updateSessionSummary } from "@student/db";
import z from "zod";

import { summarizeTranscript } from "@student/ai/services";
import { createTranscriptionObjectKey, readFile } from "../../utils/s3";

export const SummarizeTranscriptionInputSchema = z.object({
  sessionId: z.string(),
});

export const summarizeTranscription = async (
  ctx: AuthContext,
  data: z.infer<typeof SummarizeTranscriptionInputSchema>
) => {
  const isAdminOrAdvisor = ["ADMIN", "ADVISOR"].includes(ctx.user.type);

  if (!isAdminOrAdvisor) {
    throw new ORPCError("FORBIDDEN", { message: "Access denied" });
  }

  const session = await getSessionById({ sessionId: data.sessionId });

  if (ctx.user.type === "ADVISOR") {
    const advisorUserId = ctx.user.id;

    if (advisorUserId !== session?.advisorUserId) {
      throw new ORPCError("FORBIDDEN", { message: "Access denied" });
    }
  }

  const transcriptionText = await readFile({
    bucket: "transcription",
    key: createTranscriptionObjectKey({
      ext: "txt",
      sessionId: data.sessionId,
      studentUserId: session?.studentUserId!,
    }),
  });

  if (transcriptionText) {
    const summary = await summarizeTranscript(transcriptionText);
    await updateSessionSummary({
      sessionId: data.sessionId,
      summary,
    });

    return { success: true };
  } else {
    throw new ORPCError("NOT_FOUND", { message: "Transcription not found" });
  }
};
