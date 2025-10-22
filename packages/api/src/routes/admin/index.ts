import { adminRoute } from "../../utils/middleware";

import {
  ScheduledSessionTimeInputSchema,
  scheduledSessionTimeRoute,
} from "./scheduled-session-time";

import {
  SendBotToMeetingInputSchema,
  sendBotToMeetingRoute,
} from "./send-bot-meeting";

import {
  saveScheduledSession,
  SaveScheduledSessionInputSchema,
} from "./save-scheduled-session";

export const admin = {
  scheduledSessionTime: adminRoute
    .input(ScheduledSessionTimeInputSchema)
    .handler(scheduledSessionTimeRoute),
  sendBotToMeeting: adminRoute
    .input(SendBotToMeetingInputSchema)
    .handler(sendBotToMeetingRoute),
  saveScheduledSession: adminRoute
    .input(SaveScheduledSessionInputSchema)
    .handler(saveScheduledSession),
};
