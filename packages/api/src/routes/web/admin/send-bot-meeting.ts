import z from "zod";
import { createAdminRouteHelper } from "../../../utils/middleware";
import { MeetingBotService } from "../../../services/meeting-bot";
import {
  createScheduleSession,
  getScheduledSessionById,
  updateScheduledSessionBotId,
  updateScheduledSessionSupersededById,
} from "@student/db";

export const SendBotToMeetingInputSchema = z.object({
  scheduledSessionId: z.string(),
  /** ISO 8601 date-time. When set, creates a scheduled bot that joins at this time (must be >10 min in future). Omit for instant bot. */
  joinAt: z.iso.datetime().optional(),
});

export const sendBotToMeetingRoute = createAdminRouteHelper({
  inputSchema: SendBotToMeetingInputSchema,
  execute: async ({ input }) => {
    const { scheduledSessionId, joinAt } = input;

    const scheduledSession = await getScheduledSessionById({
      scheduledSessionId,
    });

    if (!scheduledSession) {
      throw new Error("Scheduled session not found");
    }

    const meetingBotService = new MeetingBotService();

    const response = await meetingBotService.sendToMeeting({
      meetingCode: scheduledSession.meetingCode,
      ...(joinAt && { joinAt }),
    });

    // If the scheduled session already has a botId, create a new one
    // and link the old session to the new one via supersededById
    if (scheduledSession.botId) {
      const { scheduledSessionId: newScheduledSessionId } =
        await createScheduleSession({
          scheduledAt: scheduledSession.scheduledAt,
          advisorUserId: scheduledSession.advisorUserId ?? undefined,
          studentUserId: scheduledSession.studentUserId ?? undefined,
          meetingCode: scheduledSession.meetingCode,
          title: scheduledSession.title,
        });

      // Update the new scheduled session with the new botId
      await updateScheduledSessionBotId({
        scheduledSessionId: newScheduledSessionId,
        botId: response.id,
      });

      // Mark the old scheduled session as superseded
      await updateScheduledSessionSupersededById({
        scheduledSessionId,
        supersededById: newScheduledSessionId,
      });

      return { newScheduledSessionId };
    }

    await updateScheduledSessionBotId({
      scheduledSessionId,
      botId: response.id,
    });
  },
});
