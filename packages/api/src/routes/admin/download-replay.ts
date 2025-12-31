import { createRouteHelper } from "../../utils/middleware";
import z from "zod";
import { MeetingBotService } from "../../services/meeting-bot";
import { getBotIdBySessionId } from "@student/db";
import { ORPCError } from "@orpc/server";
import {
  createReplayObjectKey,
  getSignedUrl,
  uploadReplayFile,
} from "../../utils/s3";

export const DownloadReplayInputSchema = z.object({
  sessionId: z.string(),
});

export const downloadReplayRoute = createRouteHelper({
  inputSchema: DownloadReplayInputSchema,
  execute: async ({ input }) => {
    const meetingBotService = new MeetingBotService();

    const session = await getBotIdBySessionId({ sessionId: input.sessionId });

    if (!session?.botId) {
      throw new ORPCError("BAD_REQUEST");
    }

    const response = await meetingBotService.getMeetingInformation({
      botId: session.botId,
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
