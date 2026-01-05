import { NewStudentDialog } from "@/features/dialogs/new-student";
import { StudentTable } from "@/features/tables/student";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { orpc } from "orpc/client";

import { useAuthUser } from "../_authenticated";
import { Breadcrumb } from "@/features/breadcrumb";
import { UserCrumb } from "@/features/breadcrumb/user-crumb";
import { StudentIcon } from "@phosphor-icons/react";

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
    <div className="flex-1">
      <Breadcrumb
        paths={[
          {
            label: "Students",
            to: "/students",
            component: (
              <div className="flex gap-2.5 items-center">
                <StudentIcon />
                Students
              </div>
            ),
          },
          currentStudentUserId
            ? {
                label: "Student",
                to: "./$userId",
                component: <UserCrumb userId={currentStudentUserId} />,
              }
            : undefined,
        ]}
        className="py-3.5"
        rightComponent={<NewStudentDialog />}
      />
      <div className="flex h-[calc(100vh-65px)]">
        <div className="flex flex-1 p-4 pt-2.5 text-left">
          <div className="flex-1 flex-col flex">
            <StudentTable
              data={students}
              currentStudentUserId={currentStudentUserId}
              isError={studentsQuery.isError}
              isLoading={studentsQuery.isLoading}
            />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
