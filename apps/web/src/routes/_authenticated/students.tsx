import { NewStudentDialog } from "@/features/dialogs/new-student";
import { StudentTable } from "@/features/tables/student";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { orpc } from "orpc/client";

import { useAuthUser } from "../_authenticated";

export const Route = createFileRoute("/_authenticated/students")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({
    from: "/_authenticated/students/$userId",
    shouldThrow: false,
  });

  const currentStudentUserId = params?.userId;

  const { user } = useAuthUser();

  const studentsQuery = useQuery(
    orpc.student.list.queryOptions({ input: { advisorUserId: user.id } })
  );

  const students = studentsQuery.data ?? [];

  return (
    <>
      <div className="flex flex-1 p-4 pt-2.5 h-screen text-left">
        <div className="flex-1 flex-col flex">
          <div className="flex items-center justify-between p-2.5">
            <div>Students</div>
            <NewStudentDialog />
          </div>
          <StudentTable
            data={students}
            currentStudentUserId={currentStudentUserId}
            isError={studentsQuery.isError}
            isLoading={studentsQuery.isLoading}
          />
        </div>
      </div>
      <Outlet />
    </>
  );
}
