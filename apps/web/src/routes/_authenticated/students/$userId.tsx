import { Input } from "@/components/input";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/students/$userId")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex-1 bg-white border-l border-bzinc flex flex-col">
      <div className="px-4 pt-7 pb-4 border-b border-bzinc">
        <Link to="/students">
          <ArrowLeftIcon />
        </Link>
      </div>
      <div className="flex flex-1">
        <div className="flex-1 flex flex-col gap-4 p-4">
          <Input label="Location" />
          <Input label="Grade Level" />
        </div>
        <div className="flex-1 border-l border-bzinc"></div>
      </div>
    </div>
  );
}
