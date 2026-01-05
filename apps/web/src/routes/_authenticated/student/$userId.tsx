import { Breadcrumb } from "@/features/breadcrumb";
import { StudentSessionTable } from "@/features/tables/student-session";
import { UserOverviewTab } from "@/features/user-tabs";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "orpc/client";
import z from "zod";

export const Route = createFileRoute("/_authenticated/student/$userId")({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        tab: z
          .enum(["profile", "extracurricular", "sessions"])
          .default("profile")
          .optional(),
      })
      .parse(search),
});

function RouteComponent() {
  const params = Route.useParams();
  const search = Route.useSearch();

  const studentQuery = useQuery(
    orpc.session.getStudentSessions.queryOptions({
      input: { studentUserId: params.userId },
    })
  );

  const student = studentQuery.data;

  return (
    <div className="flex-1 h-screen flex flex-col">
      <Breadcrumb
        paths={[
          { label: "Sessions", to: "/students/$userId" },
          { label: student?.name ?? "", to: "/student/$userId" },
        ]}
      />
      <div className="flex flex-1 text-left h-[calc(100vh-100px)]">
        <div className="flex-1 flex-col flex p-4">
          <div className="rounded-md bg-white flex-1 flex flex-col border border-bzinc overflow-hidden">
            <StudentSessionTable
              data={student?.sessions ?? []}
              isError={studentQuery.isError}
            />
          </div>
        </div>
        <UserOverviewTab
          className="max-w-md"
          studentUserId={params.userId}
          currentTab={search.tab ?? "profile"}
          isSettingsDisabled
        />
      </div>
    </div>
  );
}
