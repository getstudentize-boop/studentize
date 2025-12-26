import { privateRoute } from "../../utils/middleware";

import {
  CreateScheduleSessionInputSchema,
  createScheduleSessionRoute,
} from "./create";

import { listScheduledSessionsRoute } from "./list";

import {
  DeleteScheduledSessionInputSchema,
  deleteScheduledSessionRoute,
} from "./delete-session";

import {
  sendBotToMeetingRoute,
  SendBotToMeetingInputSchema,
} from "./send-bot-meeting";

import { authenticateGoogleRoute } from "./authenticate";

import { listGoogleCalendarRoute } from "./list-google-calendar";

import { forcSyncScheduledSessionRoute } from "./force-sync";

import { endMeetingRoute, EndMeetingInputSchema } from "./end-meeting";

export const scheduledSession = {
  create: privateRoute
    .input(CreateScheduleSessionInputSchema)
    .handler(createScheduleSessionRoute),
  list: privateRoute.handler(listScheduledSessionsRoute),
  sendBotToMeeting: privateRoute
    .input(SendBotToMeetingInputSchema)
    .handler(sendBotToMeetingRoute),
  delete: privateRoute
    .input(DeleteScheduledSessionInputSchema)
    .handler(deleteScheduledSessionRoute),
  authenticateGoogle: privateRoute.handler(authenticateGoogleRoute),
  listGoogleCalendar: privateRoute.handler(listGoogleCalendarRoute),
  forceSync: privateRoute.handler(forcSyncScheduledSessionRoute),
  endMeeting: privateRoute
    .input(EndMeetingInputSchema)
    .handler(endMeetingRoute),
};
