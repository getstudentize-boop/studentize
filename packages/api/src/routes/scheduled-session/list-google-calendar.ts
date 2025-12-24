import { db, schema, eq } from "@student/db";
import { createRouteHelper } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const getGoogleCalendar = async (input: { calendarId: string }) => {
  const { calendarId } = input;

  const response = await fetch(
    `https://us-west-2.recall.ai/api/v2/calendar-events/?calendar_id=${calendarId}`,
    {
      headers: {
        accept: "application/json",
        Authorization: `${process.env.RECALLAI_API_KEY}`,
      },
    }
  );

  const data = (await response.json()) as {
    results: {
      id: string;
      meeting_url: string;
      start_time: string;
      calendar_id: string;
      raw: {
        summary: string;
        attendees: {
          email: string;
          name: string;
        }[];
        start: {
          dateTime: string;
          timezone: string;
        };
        end: {
          dateTime: string;
          timezone: string;
        };
      };
    }[];
  };

  return data.results;
};

export const listGoogleCalendarRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    if (ctx.user.type !== "ADMIN") {
      throw new ORPCError("FORBIDDEN");
    }

    const [calendar] = await db
      .select({
        calendarId: schema.calendar.calendarId,
      })
      .from(schema.calendar)
      .where(eq(schema.calendar.userId, ctx.user.id))
      .limit(1);

    if (!calendar) {
      return null;
    }

    const calendarEvents = await getGoogleCalendar({
      calendarId: calendar.calendarId,
    });

    return calendarEvents;
  },
});
