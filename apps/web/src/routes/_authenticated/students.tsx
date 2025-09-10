import { NewStudentDialog } from "@/features/dialogs/new-student";
import { StudentTable } from "@/features/tables/student";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "orpc/client";

export const Route = createFileRoute("/_authenticated/students")({
  component: RouteComponent,
});

function RouteComponent() {
  const studentsQuery = useQuery(orpc.student.list.queryOptions());

  const students = studentsQuery.data ?? [];

  return (
    <div className="flex flex-1 p-4 pt-2.5 h-screen text-left">
      <div className="flex-1 flex-col flex">
        <div className="flex items-center justify-between p-2.5">
          <div>Students</div>
          <NewStudentDialog />
        </div>
        <div className="border border-bzinc bg-white rounded-lg flex-1 text-left">
          <StudentTable
            data={students.map((s) => ({
              name: s.name || "Unknown",
              sessions: 0,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
