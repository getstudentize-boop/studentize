import { getAdvisorsSessions } from "@student/db";
import { createRouteHelper } from "../../utils/middleware";
import z from "zod";

export const GetScheduledSessionsInputSchema = z.object({
  timePeriod: z.enum(["past", "upcoming"]),
});

export const getScheduledSessionsRoute = createRouteHelper({
  inputSchema: GetScheduledSessionsInputSchema,
  execute: async ({ ctx, input }) => {
    const userId = ctx.user.id;

    const scheduledSessions = await getAdvisorsSessions({
      advisorUserId: userId,
      timePeriod: input.timePeriod,
      today: new Date(),
    });

    return scheduledSessions;
  },
});
