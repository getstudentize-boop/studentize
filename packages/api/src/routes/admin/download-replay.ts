import { createAdminRouteHelper } from "../../utils/middleware";
import z from "zod";
import { MeetingBotService } from "../../services/meeting-bot";
import {
  getBotIdBySessionId,
  getScheduledSessionByBotId,
  getScheduledSessionByCreatedSessionId,
  getSessionById,
} from "@student/db";
import { ORPCError } from "@orpc/server";
import {
  createReplayObjectKey,
  getSignedUrl,
  uploadReplayFile,
} from "../../utils/s3";

export const DownloadReplayInputSchema = z.object({
  sessionId: z.string(),
});

export const downloadReplayRoute = createAdminRouteHelper({
  inputSchema: DownloadReplayInputSchema,
  execute: async ({ input }) => {
    const meetingBotService = new MeetingBotService();

    const scheduledSession = await getScheduledSessionByCreatedSessionId({
      sessionId: input.sessionId,
    });

    const session = await getSessionById({ sessionId: input.sessionId });

    if (!scheduledSession?.botId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Bot is not attached to the session",
      });
    }

    if (!session?.studentUserId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Student user ID is not found",
      });
    }

    const response = await meetingBotService.getMeetingInformation({
      botId: scheduledSession.botId,
    });

    const recording = response.recordings[0];

    const video = recording.media_shortcuts.video_mixed;

    // download the video
    const videoResponse = await fetch(video.data.download_url);
    const videoBlob = await videoResponse.blob();

    const uploadUrl = await getSignedUrl(
      "session-replay",
      createReplayObjectKey({
        sessionId: input.sessionId,
        studentUserId: session.studentUserId ?? "",
      })
    );

    await uploadReplayFile({
      uploadUrl,
      file: videoBlob,
    });

    return {
      success: true,
    };
  },
});
