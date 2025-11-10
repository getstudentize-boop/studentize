import { Button } from "@/components/button";
import { StudentSessionTable } from "@/features/tables/student-session";
import {
  BrainIcon,
  CalendarBlankIcon,
  ChalkboardTeacherIcon,
  ClockIcon,
  EnvelopeIcon,
  GearIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/student/")({
  component: RouteComponent,
});

const StudentOverview = () => {
  return (
    <div className="flex items-center border-b border-bzinc">
      <div className="flex-1 flex flex-col justify-center px-10 py-8 border-r border-bzinc">
        <div className="font-semibold">Hi Khaya 👋</div>
        <div className="flex gap-2 items-center mt-2.5 mb-2">
          <EnvelopeIcon className="size-4" />
          <div>kzulu321@gmail.com</div>
          <div className="text-zinc-600">●</div>
          <div>Joined 12 Jan 2025</div>
        </div>
        <div className="flex -translate-x-0.5 gap-2 items-center">
          <div className="rounded-lg border border-bzinc bg-zinc-50 px-2 py-0.5 text-sm">
            IB Graduate
          </div>
          <div className="rounded-lg border border-bzinc bg-zinc-50 px-2 py-0.5 text-sm">
            UK, CND, AUS
          </div>
          <button>
            <GearIcon />
          </button>
        </div>
      </div>
      <div className="p-10 px-12 py-8 flex gap-10">
        <div>
          <div className="font-semibold text-2xl flex items-center gap-2">
            <BrainIcon className="size-4" />
            <span className="text-indigo-800">10</span>
          </div>
          <div>No. of Chats</div>
        </div>
        <div>
          <div className="font-semibold text-2xl flex items-center gap-2">
            <VideoCameraIcon className="size-4" />
            <span className="text-cyan-800">5</span>
          </div>
          <div>No. of Sessions</div>
        </div>
      </div>
    </div>
  );
};

const SessionCard = () => {
  return (
    <div className="px-6 py-4 border-b border-bzinc">
      <div className="font-semibold mb-4">Sarah Johnson x Khaya</div>
      <div>
        <div className="flex gap-2 items-center mb-2">
          <CalendarBlankIcon className="size-4" />
          <div>Wednesday November 5, 2025</div>
        </div>
        <div className="flex gap-2 items-center">
          <ClockIcon className="size-4" />
          <div>9:30 pm</div>
        </div>
      </div>
      <Button className="mt-4 rounded-md w-full" variant="neutral">
        Join Meeting (xysadr)
      </Button>
    </div>
  );
};

function RouteComponent() {
  return (
    <div className="py-10 px-5 pr-10 flex-1 flex gap-4 text-left">
      <div className="flex-[2] flex flex-col border border-bzinc rounded-lg bg-white overflow-hidden">
        <StudentOverview />
        <div className="flex w-full h-full">
          <div className="w-10 bg-zinc-50 border-r border-bzinc" />
          <div className="flex-1 flex">
            <StudentSessionTable
              isError={false}
              data={[
                {
                  id: "1",
                  student: "John Doe",
                  title: "Math Tutoring",
                  createdAt: new Date(),
                  advisor: "Sarah Johnson",
                },
                {
                  id: "2",
                  student: "Jane Smith",
                  title: "Physics Help",
                  createdAt: new Date(),
                  advisor: "Michael Brown",
                },
              ]}
              currentSessionId="2"
            />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 flex flex-col">
        <div className="border border-bzinc rounded-lg bg-white p-6">
          <div className="font-semibold mb-1 flex items-center gap-2">
            <ChalkboardTeacherIcon className="size-4" weight="bold" />
            Advisor
          </div>
          <div>Sarah Johnson (Physics)</div>

          <div className="font-semibold mt-2 mb-1 flex items-center gap-2">
            <VideoCameraIcon className="size-4" weight="bold" />
            Upcoming Session
          </div>
          <div className="underline">Khaya x Sarah</div>
        </div>
        <div className="flex-1 border border-bzinc rounded-lg bg-white overflow-hidden">
          <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200">
            Past Sessions
          </div>
          <SessionCard />
          <SessionCard />
        </div>
      </div>
    </div>
  );
}
