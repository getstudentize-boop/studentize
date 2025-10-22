import z from "zod";
import { createAdminRouteHelper } from "../../utils/middleware";
import { MeetingBotService } from "../../services/meeting-bot";
import {
  getScheduledSessionById,
  updateScheduledSessionBotId,
} from "@student/db";

export const SendBotToMeetingInputSchema = z.object({
  scheduledSessionId: z.string(),
});

export const sendBotToMeetingRoute = createAdminRouteHelper({
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

    const response = await meetingBotService.sendToMeeting({
      meetingCode: scheduledSession?.meetingCode,
    });

    await updateScheduledSessionBotId({
      scheduledSessionId,
      botId: response.id,
    });
  },
});
