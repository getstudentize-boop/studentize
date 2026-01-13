import {
  createFileRoute,
  Outlet,
  useMatchRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";

import { ArrowsLeftRightIcon, PlusIcon } from "@phosphor-icons/react";

import Avvatar from "avvvatars-react";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { SessionTable } from "@/features/tables/session";
import { useState } from "react";
import { Button } from "@/components/button";
import { CreateSession } from "@/features/create-session";
import { AutoSyncSessionTable } from "@/features/tables/auto-sync-session";

export const Route = createFileRoute("/_authenticated/sessions")({
  component: RouteComponent,
});

function RouteComponent() {
  const route = useMatchRoute();

  const params = useParams({
    from: "/_authenticated/sessions/$sessionId",
    shouldThrow: false,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isAutoSync, setIsAutoSync] = useState(false);

  const navigate = useNavigate();

  const isUserSession = route({ to: "/sessions/user/$sessionId" });

  const listSessionsQuery = useQuery(
    orpc.session.list.queryOptions({ input: {} })
  );

  const listAutoSyncSessionsQuery = useQuery(
    orpc.session.listAutoSync.queryOptions({ input: {} })
  );

  const sessions = listSessionsQuery.data ?? [];
  const autoSyncSessions = listAutoSyncSessionsQuery.data ?? [];

  if (isUserSession) {
    return <Outlet />;
  }

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-2.5 h-screen">
        <div className="justify-between items-center flex p-2.5">
          <div className="flex gap-2 items-center">Sessions</div>

          <Button variant="primary" onClick={() => setIsOpen(!isOpen)}>
            New Session
            <PlusIcon />
          </Button>
        </div>
        <div className="flex-1 flex flex-col rounded-lg border border-bzinc text-left bg-white">
          <div className="p-2 border-b border-bzinc flex justify-between items-center">
            <div className="border border-zinc-200 rounded-lg inline-flex items-center">
              <div className="p-2 border-r border-zinc-200/80">
                <Avvatar size={20} value="test" style="shape" />
              </div>
              <div className="px-2">
                <input
                  placeholder="Search User"
                  className="min-w-80 outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => setIsAutoSync((prevState) => !prevState)}
              className="flex gap-2 items-center py-1 px-2 border border-bzinc rounded-md"
            >
              <ArrowsLeftRightIcon />
              <div>
                {isAutoSync ? "Create" : "Switch to auto-synced sessions"}
              </div>

              {!isAutoSync ? (
                <>
                  <div className="h-3.5 w-[1px] bg-bzinc" />

                  <div className="text-sm font-semibold text-green-600">
                    {autoSyncSessions.length}
                  </div>
                </>
              ) : null}
            </button>
          </div>

          {isAutoSync ? (
            <AutoSyncSessionTable
              isLoading={listAutoSyncSessionsQuery.isLoading}
              isError={listAutoSyncSessionsQuery.isError}
              data={autoSyncSessions}
            />
          ) : (
            <SessionTable
              isLoading={listSessionsQuery.isLoading}
              isError={listSessionsQuery.isError}
              data={sessions}
              currentSessionId={params?.sessionId}
            />
          )}
        </div>
      </div>
      {isOpen ? (
        <CreateSession
          onBack={() => {
            setIsOpen(false);
            navigate({ to: "/sessions" });
          }}
          onComplete={() => setIsOpen(false)}
        />
      ) : (
        <Outlet />
      )}
    </>
  );
}
