import { createAdminRouteHelper } from "../../utils/middleware";
import z from "zod";

import { getScheduledSessionTimeById } from "@student/db";

export const ScheduledSessionTimeInputSchema = z.object({
  scheduledSessionId: z.string(),
});

export const scheduledSessionTimeRoute = createAdminRouteHelper({
  inputSchema: ScheduledSessionTimeInputSchema,
  execute: async ({ input }) => {
    const { scheduledSessionId } = input;

    const scheduledSession = await getScheduledSessionTimeById({
      scheduledSessionId,
    });

    return scheduledSession;
  },
});
