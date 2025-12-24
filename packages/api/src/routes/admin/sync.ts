import { createAdminRouteHelper } from "../../utils/middleware";
import { getGoogleCalendar } from "../scheduled-session/list-google-calendar";
import { db, schema, eq, createScheduleSession } from "@student/db";
import { WorkerService } from "../../services/worker";

export const syncScheduledSessionsRoute = createAdminRouteHelper({
  execute: async () => {
    const calendars = await db
      .select({
        calendarId: schema.calendar.calendarId,
      })
      .from(schema.calendar);

    const now = new Date();

    for (const calendar of calendars) {
      const data = await getGoogleCalendar({ calendarId: calendar.calendarId });

      const workerService = new WorkerService();

      for (const event of data) {
        const code = event.meeting_url.split("/").pop();

        // only sync events that are in the future
        if (new Date(event.start_time) < now) {
          continue;
        }

        if (!code) {
          continue;
        }

        const [existingScheduledSession] = await db
          .select({
            id: schema.scheduledSession.id,
          })
          .from(schema.scheduledSession)
          .where(eq(schema.scheduledSession.googleEventId, event.id))
          .limit(1);

        if (existingScheduledSession) {
          continue;
        }

        const scheduledSession = await createScheduleSession({
          scheduledAt: new Date(event.start_time),
          meetingCode: code,
          title: event.raw.summary,
          googleEventId: event.id,
        });

        await workerService.triggerAutoJoinMeeting({
          scheduledSessionId: scheduledSession.scheduledSessionId,
        });
      }
    }

    return calendars;
  },
});
