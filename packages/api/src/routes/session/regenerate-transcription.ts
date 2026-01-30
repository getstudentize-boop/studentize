import { getScheduledSessionByCreatedSessionId, getSessionById } from "@student/db";
import z from "zod";
import { ORPCError } from "@orpc/server";
import { MeetingBotService } from "../../services/meeting-bot";
import {
  createTranscriptionObjectKey,
  getSignedUrl,
  uploadTextFile,
} from "../../utils/s3";
import { AuthContext } from "../../utils/middleware";

export const RegenerateTranscriptionInputSchema = z.object({
  sessionId: z.string(),
});

export const regenerateTranscription = async (
  ctx: AuthContext,
  input: z.infer<typeof RegenerateTranscriptionInputSchema>
) => {
  const session = await getSessionById({ sessionId: input.sessionId });

  if (!session || !session?.studentUserId) {
    throw new ORPCError("NOT_FOUND", { message: "Session not found" });
  }

  // Only allow owners, admins, and advisors to regenerate transcriptions
  const isAdminOrAdvisor = ["OWNER", "ADMIN", "ADVISOR"].includes(ctx.user.organization.role);

  if (!isAdminOrAdvisor) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "You don't have permission to regenerate transcriptions",
    });
  }

  // Get the scheduled session to find the botId
  const scheduledSession = await getScheduledSessionByCreatedSessionId({
    sessionId: input.sessionId,
  });

  if (!scheduledSession || !scheduledSession.botId) {
    throw new ORPCError("NOT_FOUND", {
      message: "No meeting bot associated with this session. Transcription cannot be regenerated.",
    });
  }

  const meetingBotService = new MeetingBotService();

  const response = await meetingBotService.getMeetingInformation({
    botId: scheduledSession.botId,
  });

  const doneStatusChange = response.status_changes.find((c) => c.code === "done");

  if (!doneStatusChange) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Meeting is not done yet. Cannot regenerate transcription.",
    });
  }

  const transcriptionData = await meetingBotService.getMeetingTranscription({
    information: response,
  });

  const transcriptText = transcriptionData
    .map((entry) => {
      const minutes = Math.floor(entry.words[0].start_timestamp.relative / 60);
      const seconds = Math.floor(entry.words[0].start_timestamp.relative % 60);
      const timestamp = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      const content = entry.words.map((word) => word.text).join(" ");
      return `${timestamp} - ${entry.participant.name}\n${content}`;
    })
    .join("\n\n");

  const uploadUrl = await getSignedUrl(
    "transcription",
    createTranscriptionObjectKey({
      ext: "txt",
      studentUserId: session.studentUserId,
      sessionId: input.sessionId,
    }),
    { type: "put" }
  );

  await uploadTextFile({ uploadUrl, content: transcriptText });

  return { success: true };
};
