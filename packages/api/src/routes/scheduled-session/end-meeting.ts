import { getScheduledSessionById } from "@student/db";
import { createRouteHelper } from "../../utils/middleware";

import { saveScheduledSession } from "../admin/save-scheduled-session";

import z from "zod";

export const EndMeetingInputSchema = z.object({
  scheduledSessionId: z.string(),
});

export const endMeetingRoute = createRouteHelper({
  inputSchema: EndMeetingInputSchema,
  execute: async ({ input }) => {
    const { scheduledSessionId } = input;

    const scheduleSession = await getScheduledSessionById({
      scheduledSessionId,
    });

    if (!scheduleSession?.botId) {
      throw new Error("Scheduled and bot not found");
    }

    await saveScheduledSession({ input: { botId: scheduleSession.botId } });
  },
});
