import {
  createFileRoute,
  Outlet,
  useMatchRoute,
  useParams,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { MySessionTable } from "@/features/tables/my-session";
import { MySessionsTab } from "@/features/user-tabs/my-sessions";

export const Route = createFileRoute("/_authenticated/student/sessions")({
  component: SessionsPage,
});

function SessionsPage() {
  const route = useMatchRoute();

  const params = useParams({
    from: "/_authenticated/student/sessions/$sessionId",
    shouldThrow: false,
  });

  const isSessionDetail = route({ to: "/student/sessions/$sessionId" });

  const sessionsQuery = useQuery(
    orpc.student.getMySessions.queryOptions({ input: {} })
  );

  const sessions = sessionsQuery.data ?? [];

  if (isSessionDetail) {
    return <Outlet />;
  }

  return (
    <>
      <div className="flex flex-1 h-screen text-left gap-4">
        <div className="flex-1 flex-col flex p-4 pt-2.5">
          <div className="flex items-center justify-between p-2.5">
            <div>Sessions</div>
          </div>
          <div className="rounded-md bg-white flex-1 flex flex-col border border-bzinc overflow-hidden">
            <MySessionTable
              data={sessions}
              isError={sessionsQuery.isError}
              isLoading={sessionsQuery.isPending}
              currentSessionId={params?.sessionId}
            />
          </div>
        </div>
        <div className="w-[35rem] bg-white border-l border-bzinc flex flex-col text-left">
          <div className="flex-1 overflow-auto custom-scrollbar">
            {params?.sessionId ? (
              <MySessionsTab sessionId={params.sessionId} />
            ) : (
              <div className="p-6 text-center text-zinc-500">
                Select a session to view details
              </div>
            )}
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
