import z from "zod";
import { createRouteHelper } from "../../utils/middleware";
import { MeetingBotService } from "../../services/meeting-bot";
import { getScheduledSessionById } from "@student/db";

export const SendBotToMeetingInputSchema = z.object({
  scheduledSessionId: z.string(),
});

export const sendBotToMeetingRoute = createRouteHelper({
  inputSchema: SendBotToMeetingInputSchema,
  execute: async ({ input }) => {
    const { scheduledSessionId } = input;

    const scheduledSession = await getScheduledSessionById({
      scheduledSessionId,
    });

    if (!scheduledSession) {
      throw new Error("Scheduled session not found");
    }

    const meetingBotService = new MeetingBotService();

    await meetingBotService.sendToMeeting({
      meetingCode: scheduledSession?.meetingCode,
    });

    return { success: true };
  },
});
