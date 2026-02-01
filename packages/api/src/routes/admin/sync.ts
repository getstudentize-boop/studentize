import { createAdminRouteHelper } from "../../utils/middleware";
import { getGoogleCalendar } from "../scheduled-session/list-google-calendar";
import {
  db,
  schema,
  eq,
  createScheduleSession,
  updateScheduledSessionTime,
} from "@student/db";
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
        if (!event.meeting_url) {
          continue;
        }

        const code = event.meeting_url.split("/").pop();

        // only sync events that are in the future
        if (new Date(event.start_time) < now) {
          continue;
        }

        if (!code) {
          continue;
        }

        const existingScheduledSession =
          await db.query.scheduledSession.findFirst({
            where: eq(schema.scheduledSession.googleEventId, event.id),
            columns: {
              id: true,
              scheduledAt: true,
            },
          });

        const newScheduledAt = new Date(event.start_time);

        if (existingScheduledSession) {
          // Check if the meeting time has changed (rescheduled)
          const existingTime = new Date(existingScheduledSession.scheduledAt);
          if (existingTime.getTime() !== newScheduledAt.getTime()) {
            // Meeting was rescheduled - update the time and recreate the workflow
            await updateScheduledSessionTime({
              scheduledSessionId: existingScheduledSession.id,
              scheduledAt: newScheduledAt,
            });

            // Recreate the workflow with the new time
            await workerService.triggerAutoJoinMeeting({
              scheduledSessionId: existingScheduledSession.id,
            });
          }

          continue;
        }

        const scheduledSession = await createScheduleSession({
          scheduledAt: newScheduledAt,
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
