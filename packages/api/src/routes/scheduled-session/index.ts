import { privateRoute } from "../../utils/middleware";

import {
  CreateScheduleSessionInputSchema,
  createScheduleSessionRoute,
} from "./create";

import { listScheduledSessionsRoute } from "./list";

export const scheduledSession = {
  create: privateRoute
    .input(CreateScheduleSessionInputSchema)
    .handler(createScheduleSessionRoute),
  list: privateRoute.handler(listScheduledSessionsRoute),
};
