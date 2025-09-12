import { AuthContext } from "@/utils/middleware";
import { ORPCError } from "@orpc/server";
import { updateSessionSummary } from "@student/db";
import z from "zod";

import { summarizeTranscript } from "@student/ai/services";
import { createTranscriptionObjectKey, readFile } from "../../utils/s3";

import { authenticateSession } from "../../route-utils";

export const SummarizeTranscriptionInputSchema = z.object({
  sessionId: z.string(),
});

export const summarizeTranscription = async (
  ctx: AuthContext,
  data: z.infer<typeof SummarizeTranscriptionInputSchema>
) => {
  const session = await authenticateSession(ctx, data);

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
