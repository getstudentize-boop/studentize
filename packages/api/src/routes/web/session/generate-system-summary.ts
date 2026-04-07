import { AuthContext } from "../../../utils/middleware";
import { ORPCError } from "@orpc/server";
import { updateSessionSystemSummary, getSessionById } from "@student/db";
import z from "zod";

import { generateSystemSummary } from "@student/ai/services";
import { createTranscriptionObjectKey, readFile } from "../../../utils/s3";

export const GenerateSystemSummaryInputSchema = z.object({
  sessionId: z.string(),
});

export const generateSystemSummaryRoute = async (
  ctx: AuthContext,
  data: z.infer<typeof GenerateSystemSummaryInputSchema>,
) => {
  if (!["OWNER", "ADMIN"].includes(ctx.user.organization.role)) {
    throw new ORPCError("FORBIDDEN", { message: "Admin access required" });
  }

  const session = await getSessionById({ sessionId: data.sessionId });

  if (!session) {
    throw new ORPCError("NOT_FOUND", { message: "Session not found" });
  }

  const transcriptionText = await readFile({
    bucket: "transcription",
    key: createTranscriptionObjectKey({
      ext: "txt",
      sessionId: data.sessionId,
      studentUserId: session.studentUserId!,
    }),
  });

  if (!transcriptionText) {
    throw new ORPCError("NOT_FOUND", { message: "Transcription not found" });
  }

  const systemSummary = await generateSystemSummary(transcriptionText);

  await updateSessionSystemSummary({
    sessionId: data.sessionId,
    systemSummary,
  });

  return { success: true };
};
