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

    // const session = await getBotIdBySessionId({ sessionId: input.sessionId });

    // if (!session?.botId) {
    //   throw new ORPCError("BAD_REQUEST");
    // }

    const response = await meetingBotService.getMeetingInformation({
      botId: "7e343fd5-f632-4cd8-8595-c876c8611e49",
    });

    const recording = response.recordings[0];

    const video = recording.media_shortcuts.video_mixed;

    console.log("🔥".repeat(10), video.data.download_url);

    // download the video
    const videoResponse = await fetch(video.data.download_url);
    const videoBlob = await videoResponse.blob();

    console.log("downloading...");

    const uploadUrl = await getSignedUrl(
      "session-replay",
      createReplayObjectKey({
        sessionId: input.sessionId,
        studentUserId: "test",
      })
    );

    console.log("Uploading...");

    await uploadReplayFile({
      uploadUrl,
      file: videoBlob,
    });

    return {
      success: true,
    };
  },
});
