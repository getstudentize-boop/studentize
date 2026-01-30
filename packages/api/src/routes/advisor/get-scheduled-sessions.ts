import { getAdvisorsSessions } from "@student/db";
import { createRouteHelper } from "../../utils/middleware";
import z from "zod";
import {
  addDays,
  addWeeks,
  isTomorrow,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";

export const GetScheduledSessionsInputSchema = z.object({
  timePeriod: z.enum(["past", "upcoming"]),
});

export const getScheduledSessionsRoute = createRouteHelper({
  inputSchema: GetScheduledSessionsInputSchema,
  execute: async ({ ctx, input }) => {
    const userId = ctx.user.id;

    const isAdmin = ["OWNER", "ADMIN"].includes(ctx.user.organization.role);
    const scheduledSessions = await getAdvisorsSessions({
      advisorUserId: isAdmin ? undefined : userId,
      organizationId: isAdmin ? ctx.organizationId : undefined,
      timePeriod: input.timePeriod,
      today: startOfDay(new Date()),
    });

    const scheduledSessionsToday = scheduledSessions.filter((session) => {
      return isToday(session.scheduledAt);
    });

    const scheduledSessionsTomorrow = scheduledSessions.filter((session) => {
      return isTomorrow(session.scheduledAt);
    });

    // Sessions that are after tomorrow but within the next 2 weeks
    const dayAfterTomorrow = startOfDay(addDays(new Date(), 2));
    const twoWeeksFromNow = startOfDay(addWeeks(new Date(), 2));

    const scheduledSessionsInNext2Weeks = scheduledSessions.filter(
      (session) => {
        const sessionDate = new Date(session.scheduledAt);
        // Not today, not tomorrow, and within the next 2 weeks
        return (
          !isToday(sessionDate) &&
          !isTomorrow(sessionDate) &&
          !isBefore(sessionDate, dayAfterTomorrow) &&
          isBefore(sessionDate, twoWeeksFromNow)
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
