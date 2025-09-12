import { AuthContext } from "@/utils/middleware";
import { ORPCError } from "@orpc/server";
import { getOneStudentAccess, updateSessionSummary } from "@student/db";
import z from "zod";

import { summarizeTranscript } from "@student/ai/services";
import { readFile } from "@/utils/s3";

export const SummarizeTranscriptionInputSchema = z.object({
  transcription: z.string(),
  studentUserId: z.string(),
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

  if (ctx.user.type === "ADVISOR") {
    const advisorUserId = ctx.user.id;

    const access = await getOneStudentAccess({
      advisorUserId,
      studentUserId: data.studentUserId,
    });

    if (!access) {
      throw new ORPCError("FORBIDDEN", { message: "Access denied" });
    }
  }

  const transcriptionText = await readFile({
    bucket: "transcription",
    key: data.transcription,
  });

  if (transcriptionText) {
    const summary = await summarizeTranscript(transcriptionText);
    await updateSessionSummary({
      sessionId: data.sessionId,
      summary,
    });

    return { summary };
  } else {
    throw new ORPCError("NOT_FOUND", { message: "Transcription not found" });
  }
};
