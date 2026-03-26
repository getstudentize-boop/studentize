import { NewStudentDialog } from "@/features/dialogs/new-student";
import { StudentTable } from "@/features/tables/student";
import { PageLoader } from "@/components/page-loader";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { orpc } from "orpc/client";
import { useState, useMemo } from "react";

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
  const [showAllStudents, setShowAllStudents] = useState(false);

  const { user } = useAuthUser();

  const studentsQuery = useQuery(
    orpc.student.list.queryOptions({ input: { advisorUserId: user.id } })
  );

  const allStudents = studentsQuery.data ?? [];

  const students = useMemo(() => {
    if (showAllStudents) {
      return allStudents;
    }
    return allStudents.filter((s) => s.status === "ACTIVE" || !s.status);
  }, [allStudents, showAllStudents]);

  const inactiveCount = allStudents.filter((s) => s.status === "INACTIVE").length;

  const isLoading = studentsQuery.isLoading;

  return (
    <>
      <div className="flex flex-1 p-4 pt-2.5 h-screen text-left">
        <div className="flex-1 flex-col flex">
          <div className="flex items-center justify-between p-2.5">
            <div className="flex items-center gap-4">
              <span>Students</span>
              {!isLoading && inactiveCount > 0 && (
                <button
                  onClick={() => setShowAllStudents(!showAllStudents)}
                  className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                    showAllStudents
                      ? "bg-zinc-100 border-zinc-300 text-zinc-700"
                      : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  {showAllStudents
                    ? "Showing all"
                    : `Show inactive (${inactiveCount})`}
                </button>
              )}
            </div>
            {!isLoading && <NewStudentDialog />}
          </div>
          {isLoading ? (
            <PageLoader message="Loading students..." className="bg-transparent" />
          ) : (
            <StudentTable
              data={students}
              currentStudentUserId={currentStudentUserId}
              isError={studentsQuery.isError}
              isLoading={false}
            />
          )}
        </div>
      </div>
      <Outlet />
    </>
  );
}
