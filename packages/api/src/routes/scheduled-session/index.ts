import { privateRoute } from "../../utils/middleware";

import {
  CreateScheduleSessionInputSchema,
  createScheduleSessionRoute,
} from "./create";

import { listScheduledSessionsRoute } from "./list";

import {
  sendBotToMeetingRoute,
  SendBotToMeetingInputSchema,
} from "./send-bot-meeting";

export const scheduledSession = {
  create: privateRoute
    .input(CreateScheduleSessionInputSchema)
    .handler(createScheduleSessionRoute),
  list: privateRoute.handler(listScheduledSessionsRoute),
  sendBotToMeeting: privateRoute
    .input(SendBotToMeetingInputSchema)
    .handler(sendBotToMeetingRoute),
};
