import { getAdvisorsSessions } from "@student/db";
import { createRouteHelper } from "../../utils/middleware";
import z from "zod";
import {
  addWeeks,
  endOfWeek,
  isWithinInterval,
  startOfWeek,
  isTomorrow,
  isToday,
} from "date-fns";

export const GetScheduledSessionsInputSchema = z.object({
  timePeriod: z.enum(["past", "upcoming"]),
});

export const getScheduledSessionsRoute = createRouteHelper({
  inputSchema: GetScheduledSessionsInputSchema,
  execute: async ({ ctx, input }) => {
    const userId = ctx.user.id;

    const scheduledSessions = await getAdvisorsSessions({
      advisorUserId: ctx.user.type === "ADMIN" ? undefined : userId,
      timePeriod: input.timePeriod,
      today: new Date(),
    });

    const scheduledSessionsToday = scheduledSessions.filter((session) => {
      return isToday(session.scheduledAt);
    });

    const scheduledSessionsTomorrow = scheduledSessions.filter((session) => {
      return isTomorrow(session.scheduledAt);
    });

    const scheduledSessionsInNext2Weeks = scheduledSessions.filter(
      (session) => {
        return (
          !isToday(session.scheduledAt) &&
          !isTomorrow(session.scheduledAt) &&
          isWithinInterval(session.scheduledAt, {
            start: startOfWeek(new Date()),
            end: endOfWeek(addWeeks(new Date(), 2)),
          })
        );
      }
    );

    return {
      today: scheduledSessionsToday,
      tomorrow: scheduledSessionsTomorrow,
      inNext2Weeks: scheduledSessionsInNext2Weeks,
    };
  },
});
