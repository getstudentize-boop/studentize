import { Button } from "@/components/button";
import { Loader } from "@/components/loader";
import { CardSkeleton } from "@/components/skeletons";
import { AdvisorOverviewPanel } from "@/features/overview-panel/advisor";
import {
  ArrowRightIcon,
  BrainIcon,
  CalendarBlankIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc, RouterOutputs } from "orpc/client";

import { format as dateFnFormat, isToday, isTomorrow } from "date-fns";
import { z } from "zod";
import { UserOverviewTab } from "@/features/user-tabs";
import { StudentHomeTable } from "@/features/tables/student-home";

type DateCategory = "today" | "tomorrow" | "next-week";

const getDateCategory = (sessionDate: Date): DateCategory => {
  if (isToday(sessionDate)) return "today";
  if (isTomorrow(sessionDate)) return "tomorrow";
  return "next-week";
};

const groupSessionsByDate = (
  sessions: (ScheduledSession | GoogleCalendarEvent)[]
): Record<DateCategory, (ScheduledSession | GoogleCalendarEvent)[]> => {
  const grouped: Record<DateCategory, (ScheduledSession | GoogleCalendarEvent)[]> = {
    today: [],
    tomorrow: [],
    "next-week": [],
  };

  sessions.forEach((session) => {
    const isGoogleEvent = 'raw' in session;
    const scheduledAt = isGoogleEvent ? new Date(session.start_time) : new Date(session.scheduledAt);
    const category = getDateCategory(scheduledAt);
    grouped[category].push(session);
  });

  return grouped;
};

const getCategoryLabel = (category: DateCategory): string => {
  switch (category) {
    case "today":
      return "Today";
    case "tomorrow":
      return "Tomorrow";
    case "next-week":
      return "Next Week";
  }
};

export const Route = createFileRoute("/_authenticated/home")({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        studentUserId: z.string().optional(),
        tab: z
          .enum(["profile", "extracurricular", "sessions"])
          .default("profile")
          .optional(),
      })
      .parse(search),
});

type ScheduledSession =
  RouterOutputs["advisor"]["getScheduledSessions"][number];

type GoogleCalendarEvent = RouterOutputs["scheduledSession"]["listGoogleCalendar"][number];

const SessionCard = ({
  isPast,
  scheduledSession,
}: {
  isPast?: boolean;
  scheduledSession: ScheduledSession | GoogleCalendarEvent;
}) => {
  const isGoogleEvent = 'raw' in scheduledSession;
  const title = isGoogleEvent ? scheduledSession.raw.summary : scheduledSession.title;
  const meetingUrl = isGoogleEvent ? scheduledSession.meeting_url : `https://meet.google.com/${scheduledSession.meetingCode}`;
  const scheduledAt = isGoogleEvent ? new Date(scheduledSession.start_time) : new Date(scheduledSession.scheduledAt);
  
  return (
    <div className="px-6 py-4 border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors duration-150">
      <div className="font-semibold mb-3 text-base text-zinc-900">{title}</div>
      <div className="flex gap-3 items-start justify-between">
        <div className="text-sm text-zinc-600 space-y-2">
          <div className="flex gap-2 items-center">
            <CalendarBlankIcon className="size-4 text-zinc-400" />
            <div className="text-zinc-700">
              {dateFnFormat(scheduledAt, "MMM dd")}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <ClockIcon className="size-4 text-zinc-400" />
            <div className="text-zinc-700">{dateFnFormat(scheduledAt, "hh:mm aa")}</div>
          </div>
        </div>
        {!isPast ? (
          <Button
            variant="primary"
            className="h-8 text-sm py-0 px-4 flex-shrink-0"
            onClick={() => {
              window.open(meetingUrl, "_blank");
            }}
          >
            Join
          </Button>
        ) : null}
      </div>
    </div>
  );
};

const StudentCard = ({
  student,
}: {
  student: RouterOutputs["advisor"]["getStudentList"][number];
}) => {
  return (
    <div className="border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 hover:shadow-sm transition-all duration-200">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="font-semibold text-base text-zinc-900">{student.name}</div>
          <Link
            to="/guru"
            search={{ userId: student.studentUserId }}
            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <BrainIcon
              size={18}
              className="transition-colors"
              style={{ color: '#BCFAF9', filter: 'brightness(0.7)' }}
            />
          </Link>
        </div>
      </div>
      <Link
        to="/student/$userId"
        params={{ userId: student.studentUserId }}
        className="px-4 py-3 border-t border-zinc-100 flex justify-center gap-2 items-center text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors rounded-b-lg"
      >
        View Student
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
};


const SessionCardLoader = () => {
  return (
    <div className="px-6 py-4 border-b border-bzinc">
      <div className="mb-4">
        <Loader className="w-48 h-6" />
      </div>
      <div className="space-y-2">
        <div className="flex gap-2 items-center mb-2">
          <CalendarBlankIcon className="size-4" />
          <Loader className="w-40 h-5" />
        </div>
        <div className="flex gap-2 items-center">
          <ClockIcon className="size-4" />
          <Loader className="w-20 h-5" />
        </div>
      </div>

      <Loader className="mt-4 w-full h-8" />
    </div>
  );
};

const UpcomingOrPastSessions = ({
  timePeriod,
}: {
  timePeriod: "upcoming" | "past";
}) => {
  // Use Google Calendar for upcoming sessions to match the schedule tab
  const googleCalendarQuery = useQuery(
    orpc.scheduledSession.listGoogleCalendar.queryOptions()
  );

  const allCalendarEvents = googleCalendarQuery.data ?? [];
  
  // Filter for upcoming sessions only (within 7 days from now)
  const upcomingEvents = timePeriod === "upcoming" 
    ? allCalendarEvents.filter((event) => {
        const eventDate = new Date(event.start_time);
        const today = new Date();
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        return eventDate >= today && eventDate < sevenDaysFromNow;
      }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    : [];

  const scheduledSession = upcomingEvents;
  const groupedSessions = groupSessionsByDate(scheduledSession);

  return (
    <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden flex flex-col flex-1 shadow-sm">
      <div className="px-5 py-3.5 bg-zinc-50/50 border-b border-zinc-200 font-semibold text-sm text-zinc-900">
        {timePeriod === "upcoming" ? "Upcoming Sessions" : "Past Sessions"}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!googleCalendarQuery.isPending ? (
          <>
            {scheduledSession.length > 0 ? (
              <>
                {timePeriod === "upcoming" ? (
                  <>
                    {(["today", "tomorrow", "next-week"] as DateCategory[]).map(
                      (category) => (
                        groupedSessions[category].length > 0 && (
                          <div key={category}>
                            <div className="px-6 py-2.5 bg-zinc-50 font-medium text-xs text-zinc-600 border-b border-zinc-100 uppercase tracking-wide">
                              {getCategoryLabel(category)}
                            </div>
                            {groupedSessions[category].map((session) => {
                              const isGoogleEvent = 'raw' in session;
                              const key = isGoogleEvent ? session.id : session.meetingCode;
                              return (
                                <SessionCard
                                  key={key}
                                  scheduledSession={session}
                                  isPast={false}
                                />
                              );
                            })}
                          </div>
                        )
                      )
                    )}
                  </>
                ) : (
                  <>
                    {scheduledSession.map((session) => {
                      const isGoogleEvent = 'raw' in session;
                      const key = isGoogleEvent ? session.id : session.meetingCode;
                      return (
                        <SessionCard
                          key={key}
                          scheduledSession={session}
                          isPast={true}
                        />
                      );
                    })}
                  </>
                )}
              </>
            ) : (
              <div className="px-6 py-12 text-center text-zinc-400 text-sm">
                No {timePeriod} sessions
              </div>
            )}
          </>
        ) : (
          <SessionCardLoader />
        )}
      </div>
    </div>
  );
};

function RouteComponent() {
  const search = Route.useSearch();

  const studentListQuery = useQuery(
    orpc.advisor.getStudentList.queryOptions({})
  );

  const students = studentListQuery.data ?? [];

  const currentTab = search.tab ?? "profile";

  return (
    <div className="py-8 px-6 pr-8 flex-1 flex gap-6 text-left">
      <div className="flex-[2] flex flex-col border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-sm">
        <AdvisorOverviewPanel />
        <div className="flex w-full h-full">
          <div className="w-12 bg-zinc-50/50 border-r border-zinc-100" />
          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar pb-48 h-[20vh-100px]">
            <StudentHomeTable
              data={students}
              isError={studentListQuery.isError}
              isLoading={studentListQuery.isPending}
            />
          </div>
        </div>
      </div>

      {search.studentUserId ? (
        <UserOverviewTab
          studentUserId={search.studentUserId ?? ""}
          currentTab={currentTab}
          className="flex-1 border border-zinc-200 rounded-xl shadow-sm"
          isHeaderFixedHeightDisabled
          goBack="/home"
          isSettingsDisabled
          search={{ studentUserId: search.studentUserId }}
        />
      ) : (
        <div className="flex-1 flex flex-col">
          <UpcomingOrPastSessions timePeriod="upcoming" />
        </div>
      )}
    </div>
  );
}
