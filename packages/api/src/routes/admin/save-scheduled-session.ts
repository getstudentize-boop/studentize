import {
  createSession,
  getScheduledSessionByBotId,
  updateScheduledSessionDoneAt,
  updateSessionSummary,
} from "@student/db";
import { createAdminRouteHelper } from "../../utils/middleware";
import z from "zod";
import { ORPCError } from "@orpc/server";
import { MeetingBotService } from "../../services/meeting-bot";
import {
  createTemporaryTranscriptionObjectKey,
  createTranscriptionObjectKey,
  getSignedUrl,
  uploadTextFile,
} from "../../utils/s3";

import { summarizeTranscript } from "@student/ai/services";

import { format as _format } from "date-fns";
import { downloadReplayRoute } from "./download-replay";

export const SaveScheduledSessionInputSchema = z.object({
  botId: z.string(),
});

export const saveScheduledSession = createAdminRouteHelper({
  inputSchema: SaveScheduledSessionInputSchema,
  execute: async ({ input }) => {
    const scheduledSession = await getScheduledSessionByBotId({
      botId: input.botId,
    });

    if (!scheduledSession) {
      throw new ORPCError("NOT_FOUND", {
        message: "Scheduled session not found",
      });
    }

    const meetingBotService = new MeetingBotService();

    const response = await meetingBotService.getMeetingInformation({
      botId: input.botId,
    });

    const doneStatusChange = response.status_changes.find(
      (c) => c.code === "done"
    );

    if (!doneStatusChange) {
      throw new Error("Meeting is not done yet");
    }

    const transcriptionData = await meetingBotService.getMeetingTranscription({
      information: response,
    });

    // first create the session
    const newSession = await createSession({
      studentUserId: scheduledSession.studentUserId,
      advisorUserId: scheduledSession.advisorUserId,
      title: `${scheduledSession.title} (${_format(new Date(), "MMM do, yyyy")})`,
    });

    const transcriptText = transcriptionData
      .map((entry) => {
        const minutes = Math.floor(
          entry.words[0].start_timestamp.relative / 60
        );
        const seconds = Math.floor(
          entry.words[0].start_timestamp.relative % 60
        );
        const timestamp = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        const content = entry.words.map((word) => word.text).join(" ");
        return `${timestamp} - ${entry.participant.name}\n${content}`;
      })
      .join("\n\n");

    const isGoogleSynced = scheduledSession.googleEventId !== null;

    const upload = await getSignedUrl(
      "transcription",
      isGoogleSynced || !scheduledSession.studentUserId
        ? createTemporaryTranscriptionObjectKey({
            ext: "txt",
            sessionId: newSession.id,
          })
        : createTranscriptionObjectKey({
            ext: "txt",
            studentUserId: scheduledSession.studentUserId,
            sessionId: newSession.id,
          }),
      { type: "put" }
    );

    await uploadTextFile({ uploadUrl: upload, content: transcriptText });

    await updateScheduledSessionDoneAt({
      scheduledSessionId: scheduledSession.id,
      doneAt: new Date(doneStatusChange.created_at),
      createdSessionId: newSession.id,
    });

    // summarize content of the session
    const summary = await summarizeTranscript(transcriptText);
    await updateSessionSummary({
      sessionId: newSession.id,
      summary,
    });

    await downloadReplayRoute({
      input: { sessionId: newSession.id },
      context: { user: { id: "1", status: "ACTIVE", type: "ADMIN" } },
    });

    return {
      sessionId: newSession.id,
    };
  },
});
