import { createFileRoute } from "@tanstack/react-router";

import { PlusIcon } from "@phosphor-icons/react";

import Avvatar from "avvvatars-react";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { SessionTable } from "@/features/tables/session";
import { useState } from "react";
import { Button } from "@/components/button";
import { CreateSession } from "@/features/create-session";

export const Route = createFileRoute("/_authenticated/sessions")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const listSessionsQuery = useQuery(
    orpc.session.list.queryOptions({ input: {} })
  );

  const sessions = listSessionsQuery.data ?? [];

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-2.5 h-screen">
        <div className="justify-between items-center flex p-2.5">
          <div className="flex gap-2 items-center">Sessions</div>

          <Button onClick={() => setIsOpen(!isOpen)}>
            New Session
            <PlusIcon />
          </Button>
        </div>
        <div className="flex-1 rounded-lg border border-bzinc text-left bg-white">
          <div className="p-2 border-b border-bzinc">
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
          </div>

          <SessionTable data={sessions} />
        </div>
      </div>
      {isOpen ? <CreateSession onComplete={() => setIsOpen(false)} /> : null}
    </>
  );
}
