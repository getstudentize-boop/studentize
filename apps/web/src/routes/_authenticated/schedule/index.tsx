import { Button } from "@/components/button";
import { UserSearch } from "@/features/user-search";
import {
  CalendarBlankIcon,
  ClockIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/schedule/")({
  component: RouteComponent,
});

const Schedule = ({ title }: { title: string }) => {
  return (
    <div className="rounded-lg bg-white outline outline-bzinc p-4">
      <div className="font-semibold text-lg px-2">{title}</div>

      <div className="mt-4 mb-6 space-y-2 px-2">
        <div className="flex gap-2 items-center">
          <CalendarBlankIcon className="size-4 text-zinc-500" />
          <div>Tuesday, June 18, 2024</div>
        </div>
        <div className="flex gap-2 items-center">
          <ClockIcon className="size-4 text-zinc-500" />
          <div>4:00 PM - 5:00 PM</div>
        </div>
      </div>

      <Button variant="neutral" className="rounded-md w-full">
        Join Session
      </Button>
    </div>
  );
};

function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="max-w-2xl w-full overflow-hidden bg-white rounded-xl shadow-xs outline outline-bzinc">
        <div className="p-4 flex gap-4 text-left">
          <div className="flex-1">
            <div className="font-semibold mx-0.5 mb-1">Advisor</div>
            <UserSearch
              data={[{ name: "Test", userId: "123" }]}
              placeholder="Student"
              onSearch={() => {}}
            />
          </div>
          <div className="flex-1">
            <div className="font-semibold mx-0.5 mb-1">Students</div>
            <UserSearch
              data={[{ name: "Test", userId: "123" }]}
              placeholder="Student"
              onSearch={() => {}}
            />
          </div>
          <div className="flex-1">
            <div className="font-semibold mx-0.5 mb-1">Created At</div>
            <UserSearch
              data={[{ name: "Test", userId: "123" }]}
              placeholder="Student"
              onSearch={() => {}}
            />
          </div>
        </div>
        <div className="p-8 border-t border-bzinc bg-zinc-100 flex items-center justify-center">
          <Button className="rounded-md" variant="primary">
            Schedule a Session
            <VideoCameraIcon />
          </Button>
        </div>
      </div>
      <div className="mt-4 max-w-2xl w-full grid-cols-2 grid gap-4 text-left">
        <Schedule title="Khaya x Andrew" />
        <Schedule title="Khaya x Test User" />
        <Schedule title="Khaya x New User" />
      </div>
    </div>
  );
}
