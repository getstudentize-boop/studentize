import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { UserSearch } from "@/features/user-search";
import {
  CalendarBlankIcon,
  GoogleLogoIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "orpc/client";
import { useEffect, useState } from "react";

import { format as _format, isBefore, subDays } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { ScheduleCard } from "@/features/schedule-card";

import Avvatar from "avvvatars-react";
import { cn } from "@/utils/cn";
import { Loader } from "@/components/loader";
import { Tooltip } from "@/components/tooltip";

export const Route = createFileRoute("/_authenticated/schedule/")({
  component: RouteComponent,
});

type StudentOrAdvisor = { userId: string; name: string | null } | undefined;

const CalendarCard = ({
  name,
  startDateTime,
  endDateTime,
  attendees,
  isLatest,
  meetingUrl,
}: {
  name: string;
  startDateTime: string;
  endDateTime: string;
  attendees: string[];
  isLatest: boolean;
  meetingUrl: string;
}) => {
  const day = _format(startDateTime, "dd");
  const dayOfWeek = _format(startDateTime, "EEE");
  const startTime = _format(startDateTime, "h:mm a");
  const endTime = _format(endDateTime, "h:mm a");

  const firstTwoAttendees = attendees.slice(0, 2);

  return (
    <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
      <div className="flex border border-bzinc rounded-lg items-center p-4 gap-4 bg-zinc-50">
        <div
          className={cn(
            "text-zinc-700 font-semibold text-center rounded-md px-2 py-1",
            isLatest ? "text-zinc-900 bg-[#BCFAF9]" : ""
          )}
        >
          <div>{day}</div>
          <div>{dayOfWeek}</div>
        </div>
        <div className="w-0.5 bg-zinc-200" />
        <div className="text-left">
          <div className="truncate w-44">{name}</div>
          <div>
            {startTime} - {endTime}
          </div>
        </div>

        <div className="flex items-center ml-auto">
          {firstTwoAttendees[1] ? (
            <div className="translate-x-2 border-2 border-white rounded-full">
              <Avvatar size={24} value={firstTwoAttendees[1]} style="shape" />
            </div>
          ) : null}
          <Avvatar size={24} value={firstTwoAttendees[0]} style="shape" />
        </div>
      </div>
    </a>
  );
};

const ListCalendar = () => {
  const queryClient = useQueryClient();

  const authenticateGoogleMutation = useMutation(
    orpc.scheduledSession.authenticateGoogle.mutationOptions()
  );

  const listGoogleCalendarQuery = useQuery(
    orpc.scheduledSession.listGoogleCalendar.queryOptions()
  );

  const adminSyncCalendarMutation = useMutation(
    orpc.scheduledSession.forceSync.mutationOptions()
  );

  const reconnectCalendarMutation = useMutation(
    orpc.scheduledSession.reconnectCalendar.mutationOptions({
      onSuccess: async () => {
        // Invalidate the calendar query so it shows the disconnected state
        await queryClient.invalidateQueries({
          queryKey: orpc.scheduledSession.listGoogleCalendar.queryKey(),
        });
      },
    })
  );

  const calendarEvents = listGoogleCalendarQuery.data ?? [];

  const sortedCalendarEvents = calendarEvents.sort(
    (a, b) =>
      new Date(b.raw.start.dateTime).getTime() -
      new Date(a.raw.start.dateTime).getTime()
  );

  const handleAuthenticateGoogle = async () => {
    const data = await authenticateGoogleMutation.mutateAsync({});
    window.open(data, "_blank", "noopener,noreferrer");
  };

  const handleReconnectCalendar = async () => {
    const data = await reconnectCalendarMutation.mutateAsync({});
    window.open(data, "_blank", "noopener,noreferrer");
  };

  if (listGoogleCalendarQuery.isPending) {
    return (
      <div className="h-screen w-96 bg-white border-l border-bzinc text-left flex flex-col items-center justify-center gap-4">
        <Loader className="w-40" />
        <Loader className="w-64 h-8" />
      </div>
    );
  }

  return (
    <>
      {listGoogleCalendarQuery.data ? (
        <div className="h-screen w-96 bg-white border-l border-bzinc text-left">
          <div className="mb-2 p-4 border-b border-bzinc">
            <div className="font-semibold">Calendar / Meetings</div>
            <div className="text-zinc-500 text-sm">
              Upcoming sessions will be automatically joined.
            </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar h-[calc(100vh-5rem)]">
            <div className="p-4 pt-2 flex flex-col gap-2">
              <Tooltip
                className="w-96"
                side="bottom"
                align="end"
                trigger={
                  <Button
                    className="rounded-md flex-col p-2"
                    variant="neutral"
                    onClick={() => adminSyncCalendarMutation.mutateAsync({})}
                    isLoading={adminSyncCalendarMutation.isPending}
                  >
                    Sync with calendar (every 5 minutes)
                  </Button>
                }
              >
                <div className="text-sm text-zinc-500 p-2">
                  Every 5 minutes your google calendar will be synced with your
                  scheduled sessions. Mark with
                  <span className="inline-flex gap-1 mx-1 items-center translate-y-0.5 text-green-600">
                    <GoogleLogoIcon />
                    <span>Synced</span>
                  </span>{" "}
                  on the right.
                </div>
              </Tooltip>
              <Button
                className="rounded-md p-2"
                variant="neutral"
                onClick={handleReconnectCalendar}
                isLoading={reconnectCalendarMutation.isPending}
              >
                <GoogleLogoIcon />
                Reconnect Calendar
              </Button>
              {sortedCalendarEvents?.map((event, idx) => {
                const previousEvent = calendarEvents[idx - 1];

                // is within this week and beyond
                const isBeforeCurrentWeek = isBefore(
                  event.raw.start.dateTime,
                  subDays(new Date(), 7)
                );

                const isSameMonth =
                  new Date(event.raw.start.dateTime).getMonth() ===
                  new Date(previousEvent?.raw.start.dateTime).getMonth();

                if (isBeforeCurrentWeek) {
                  return null;
                }

                return (
                  <>
                    {!isSameMonth || idx === 0 ? (
                      <div className="text-zinc-500 text-sm sticky top-0 bg-white py-2 border-b border-bzinc">
                        {_format(event.raw.start.dateTime, "MMMM yyyy")}
                      </div>
                    ) : null}
                    <CalendarCard
                      key={event.id}
                      name={event.raw.summary}
                      startDateTime={event.raw.start.dateTime}
                      endDateTime={event.raw.end.dateTime}
                      attendees={
                        event.raw.attendees?.map((attendee) => attendee.name) ??
                        []
                      }
                      isLatest={idx === 0}
                      meetingUrl={event.meeting_url}
                    />
                  </>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col w-96 bg-white border-l border-bzinc items-center justify-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <CalendarBlankIcon className="size-5" />
              <div>Auto-join sessions</div>
            </div>
            <Button
              className="rounded-md w-full flex items-center justify-center gap-2"
              onClick={handleAuthenticateGoogle}
            >
              <GoogleLogoIcon />
              Connect calendar
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

function RouteComponent() {
  const [selectedAdvisor, setSelectedAdvisor] = useState<StudentOrAdvisor>();
  const [selectedStudent, setSelectedStudent] = useState<StudentOrAdvisor>();
  const [scheduledAt, setScheduledAt] = useState<string>();

  const [isLinkRequired, setIsLinkRequired] = useState(false);
  const [meetingCode, setmeetingCode] = useState<string>("");

  const utils = useQueryClient();
  const sessionListQuery = useQuery(orpc.scheduledSession.list.queryOptions());

  const [filter, setFilter] = useState<
    "all" | "manually-created" | "synced-with-google"
  >("all");

  const sessionList = sessionListQuery.data ?? [];

  const createSessionMutation = useMutation(
    orpc.scheduledSession.create.mutationOptions({
      onSuccess: async () => {
        await utils.invalidateQueries({
          queryKey: orpc.scheduledSession.list.queryKey(),
        });

        setSelectedAdvisor(undefined);
        setSelectedStudent(undefined);
        setScheduledAt(undefined);
        setIsLinkRequired(false);
      },
    })
  );

  const searchStudentsMutation = useMutation(
    orpc.student.search.mutationOptions()
  );

  const searchAdvisorsMutation = useMutation(
    orpc.advisor.search.mutationOptions()
  );

  const availableStudents = searchStudentsMutation.data ?? [];
  const availableAdvisors = searchAdvisorsMutation.data ?? [];

  const handleCreateSession = async () => {
    if (!selectedAdvisor || !selectedStudent || !scheduledAt) {
      return;
    }

    if (!isLinkRequired) {
      setIsLinkRequired(true);
      return;
    }

    if (!meetingCode) {
      return;
    }

    const ukTime = fromZonedTime(scheduledAt, "Europe/London");

    createSessionMutation.mutate({
      advisorUserId: selectedAdvisor.userId,
      studentUserId: selectedStudent.userId,
      scheduledAt: ukTime.toISOString(),
      meetingCode,
    });
  };

  useEffect(() => {
    searchStudentsMutation.mutate({ query: "" });
    searchAdvisorsMutation.mutate({ query: "" });
  }, []);

  const Settings = () => (
    <div className="p-4 flex gap-4 text-left">
      <div className="flex-1">
        <div className="font-semibold mx-0.5 mb-1">Advisor</div>
        <UserSearch
          data={availableAdvisors}
          placeholder="Advisor"
          onSelect={setSelectedAdvisor}
          user={selectedAdvisor}
          onSearch={(query) => searchAdvisorsMutation.mutateAsync({ query })}
        />
      </div>
      <div className="flex-1">
        <div className="font-semibold mx-0.5 mb-1">Students</div>
        <UserSearch
          data={availableStudents}
          placeholder="Student"
          onSelect={setSelectedStudent}
          user={selectedStudent}
          onSearch={(query) => searchStudentsMutation.mutateAsync({ query })}
        />
      </div>
      <div className="flex-1">
        <div className="font-semibold mx-0.5 mb-1">Session Date/Time (UK)</div>
        <Input
          type="datetime-local"
          onChange={(ev) => setScheduledAt(ev.target.value)}
          value={scheduledAt}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 overflow-y-auto">
      <div className="flex flex-1 flex-col items-center p-10 overflow-y-auto no-scrollbar">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-xs outline outline-bzinc">
          {!isLinkRequired ? <Settings /> : null}

          {isLinkRequired ? (
            <div className="p-4 text-left">
              <Input
                placeholder="https://meet.google.com/qbt-kaqz-nho"
                label="Paste meeting link"
                className="w-full"
                value={meetingCode}
                onChange={(ev) => setmeetingCode(ev.target.value)}
              />
            </div>
          ) : null}

          <div className="p-8 border-t border-bzinc bg-zinc-100 flex items-center justify-center z-1">
            <Button
              className="rounded-md"
              variant={isLinkRequired ? "primary" : "secondary"}
              isLoading={createSessionMutation.isPending}
              onClick={handleCreateSession}
            >
              Schedule a Session
              <VideoCameraIcon />
            </Button>
          </div>
          <div className="p-4 border-t border-bzinc bg-zinc-100 flex gap-2">
            <button
              className={cn(
                "border border-zinc-300 rounded-lg p-1 px-2",
                filter === "all" ? "bg-white" : ""
              )}
              onClick={() => setFilter("all")}
            >
              All ({sessionList.length})
            </button>
            <button
              className={cn(
                "border border-zinc-300 rounded-lg p-1 px-2",
                filter === "manually-created" ? "bg-white" : ""
              )}
              onClick={() => setFilter("manually-created")}
            >
              Manually created
            </button>
            <button
              className={cn(
                "border border-zinc-300 rounded-lg p-1 px-2",
                filter === "synced-with-google" ? "bg-white" : ""
              )}
              onClick={() => setFilter("synced-with-google")}
            >
              Synced with Google Calendar
            </button>
          </div>
        </div>
        <div className="mt-4 max-w-2xl w-full grid-cols-2 grid gap-4 text-left">
          {sessionList?.map((session) => {
            const isGoogleSynced = !!session.googleEventId;

            if (filter === "manually-created" && isGoogleSynced) {
              return null;
            }

            if (filter === "synced-with-google" && !isGoogleSynced) {
              return null;
            }

            return <ScheduleCard key={session.id} session={session} />;
          })}
        </div>
      </div>

      <ListCalendar />
    </div>
  );
}
