import { Button } from "@/components/button";
import { Loader } from "@/components/loader";
import { AdvisorOverviewPanel } from "@/features/overview-panel/advisor";
import {
  ArrowRightIcon,
  BrainIcon,
  CalendarBlankIcon,
  ChatCircleTextIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc, RouterOutputs } from "orpc/client";

import { format as dateFnFormat } from "date-fns";
import { cn } from "@/utils/cn";
import { z } from "zod";
import { UserOverviewTab } from "@/features/user-tabs";
import { StudentHomeTable } from "@/features/tables/student-home";

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

const SessionCard = ({
  isPast,
  scheduledSession,
}: {
  isPast?: boolean;
  scheduledSession: ScheduledSession;
}) => {
  return (
    <div className="px-6 py-4 border-b border-bzinc">
      <div className="font-semibold mb-4">{scheduledSession.title}</div>
      <div>
        <div className="flex gap-2 items-center mb-2">
          <CalendarBlankIcon className="size-4" />
          <div>
            {dateFnFormat(scheduledSession.scheduledAt, "eeee MMM dd, yyyy")}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <ClockIcon className="size-4" />
          <div>{dateFnFormat(scheduledSession.scheduledAt, "hh:mm aa")}</div>
        </div>
      </div>
      {!isPast ? (
        <Button
          className="mt-4 rounded-md w-full"
          variant="neutral"
          onClick={() => {
            window.open(
              `https://meet.google.com/${scheduledSession.meetingCode}`,
              "_blank"
            );
          }}
        >
          Join Meeting ({scheduledSession.meetingCode})
        </Button>
      ) : null}
    </div>
  );
};

const StudentCard = ({
  student,
}: {
  student: RouterOutputs["advisor"]["getStudentList"][number];
}) => {
  return (
    <div className="border border-bzinc rounded-lg">
      <div className="p-4 py-3 flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="font-semibold text-[16px]">{student.name}</div>
          <Link
            to="/guru"
            search={{ userId: student.studentUserId }}
            className="underline flex gap-2 items-center"
          >
            <BrainIcon
              size={16}
              className="hover:text-cyan-600 transition-colors"
            />
          </Link>
        </div>
      </div>
      <Link
        to="/student/$userId"
        params={{ userId: student.studentUserId }}
        className="px-4 py-3 border-t border-bzinc flex justify-center gap-4 items-center"
      >
        View Student
        <ArrowRightIcon />
      </Link>
    </div>
  );
};

const StudentCardLoader = () => {
  return (
    <div className="border border-bzinc rounded-lg">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between">
          <Loader className="w-32" />
        </div>
      </div>
      <div className="px-4 py-3 border-t border-bzinc flex justify-center gap-4 items-center">
        <Loader className="w-36" />
      </div>
    </div>
  );
};

const SessionCardLoader = () => {
  return (
    <div className="px-6 py-4 border-b border-bzinc">
      <Loader className="mb-4 w-50" />
      <div>
        <div className="flex gap-2 items-center mb-2">
          <CalendarBlankIcon className="size-4" />
          <Loader className="w-50" />
        </div>
        <div className="flex gap-2 items-center">
          <ClockIcon className="size-4" />
          <Loader className="w-14" />
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
  const scheduleSessionQuery = useQuery(
    orpc.advisor.getScheduledSessions.queryOptions({
      input: { timePeriod },
    })
  );

  const scheduledSession = scheduleSessionQuery.data ?? [];

  return (
    <div
      className={cn("border border-bzinc rounded-lg bg-white overflow-hidden", {
        "flex-1": timePeriod === "past",
      })}
    >
      <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200">
        {timePeriod === "upcoming" ? "Upcoming Sessions" : "Past Sessions"}
      </div>
      {!scheduleSessionQuery.isPending ? (
        <>
          {scheduledSession.map((session) => (
            <SessionCard
              key={session.meetingCode}
              scheduledSession={session}
              isPast={timePeriod === "past"}
            />
          ))}
          {scheduledSession.length === 0 ? (
            <div className="px-6 py-4 border-b border-bzinc text-center text-zinc-500">
              No {timePeriod} sessions
            </div>
          ) : null}
        </>
      ) : (
        <SessionCardLoader />
      )}
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
    <div className="py-10 px-5 pr-10 flex-1 flex gap-4 text-left">
      <div className="flex-[2] flex flex-col border border-bzinc rounded-lg bg-white overflow-hidden">
        <AdvisorOverviewPanel />
        <div className="flex w-full h-full">
          <div className="w-10 bg-zinc-50 border-r border-bzinc" />
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar pb-48 h-[20vh-100px]">
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
          className="flex-1 border border-zinc-200 rounded-lg"
          isHeaderFixedHeightDisabled
          goBack="/home"
          isSettingsDisabled
          search={{ studentUserId: search.studentUserId }}
        />
      ) : (
        <div className="flex-1 space-y-4 flex flex-col">
          <UpcomingOrPastSessions timePeriod="upcoming" />
          <UpcomingOrPastSessions timePeriod="past" />
        </div>
      )}
    </div>
  );
}
