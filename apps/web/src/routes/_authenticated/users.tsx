import { NewStudentDialog } from "@/features/dialogs/new-student";
import { NewAdvisorDialog } from "@/features/dialogs/new-advisor";
import { AdvisorTable } from "@/features/tables/advisor";
import { StudentTable } from "@/features/tables/student";
import { cn } from "@/utils/cn";
import { PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "orpc/client";

export const Route = createFileRoute("/_authenticated/users")({
  component: RouteComponent,
});

export const Header = ({
  title,
  actionTitle,
}: {
  title: string;
  actionTitle?: string;
}) => {
  return (
    <div className="justify-between items-center flex p-2.5">
      <div className="flex gap-2 items-center">{title}</div>

      <div
        className={cn(
          "px-3 py-1.5 shadow border-b-2 border-zinc-950 flex gap-2 rounded-full text-white bg-zinc-800 items-center",
          !actionTitle && "invisible"
        )}
        aria-hidden={!actionTitle}
      >
        {actionTitle ?? "New"}
        <PlusIcon />
      </div>
    </div>
  );
};

function RouteComponent() {
  const studentsQuery = useQuery(orpc.student.list.queryOptions());
  const advisorsQuery = useQuery(orpc.advisor.list.queryOptions());

  const students = studentsQuery.data ?? [];
  const advisors = advisorsQuery.data ?? [];

  return (
    <div className="flex flex-1 p-4 pt-2.5 gap-4 h-screen text-left">
      <div className="flex-1 flex-col flex">
        <div className="flex items-center justify-between p-2.5">
          <div>Advisors</div>
          <NewAdvisorDialog />
        </div>
        <div className="border border-bzinc bg-white rounded-lg flex-1 text-left">
          <AdvisorTable
            data={advisors.map((a) => ({
              name: a.name,
              university: a.universityName,
            }))}
          />
        </div>
      </div>
      <div className="flex-1 flex-col flex">
        <div className="flex items-center justify-between p-2.5">
          <div>Students</div>
          <NewStudentDialog />
        </div>
        <div className="border border-bzinc bg-white rounded-lg flex-1 text-left">
          <StudentTable
            data={students.map((s) => ({
              name: s.name,
              sessions: 0,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
