import { createFileRoute } from "@tanstack/react-router";

import { PlusIcon, SubtitlesIcon, XIcon } from "@phosphor-icons/react";

import Avvatar from "avvvatars-react";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { SessionTable } from "@/features/tables/session";
import { Input } from "@/components/input";

export const Route = createFileRoute("/sessions")({
  component: RouteComponent,
});

function RouteComponent() {
  const listSessionsQuery = useQuery(orpc.session.list.queryOptions());

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-2.5 h-screen">
        <div className="justify-between items-center flex p-2.5">
          <div className="flex gap-2 items-center">Sessions</div>

          <div className="px-3 py-1.5 shadow border-b-2 border-zinc-950 flex gap-2 rounded-full text-white bg-zinc-800 items-center">
            New Session
            <PlusIcon />
          </div>
        </div>
        <div className="flex-1 rounded-lg border border-bzinc text-left">
          <div className="p-2 border-b border-bzinc">
            <div className="border border-zinc-200 rounded-lg inline-flex items-center">
              <div className="p-2 border-r border-zinc-200/80">
                <Avvatar size={24} value="test" />
              </div>
              <div className="px-2">
                <input
                  placeholder="Search User"
                  className="min-w-80 outline-none"
                />
              </div>
            </div>
          </div>

          <SessionTable data={listSessionsQuery.data ?? []} />
        </div>
      </div>
      <div className="w-[500px] border-l border-bzinc flex flex-col gap-4 p-4 py-7">
        <Input label="Title" placeholder="e.g: Advisory Session" />
        <div>
          <label className="mb-2 mx-1 flex justify-between">
            Transcription
          </label>
          <div className="border border-bzinc rounded-md">
            <textarea className="w-full h-32 p-2 outline-none" rows={10} />
            <div className="border-t border-bzinc p-2 text-left flex justify-between items-center">
              <SubtitlesIcon size={18} />
              <div className="flex gap-2 items-center">
                Count: 100 words
                <XIcon size={18} />
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="mb-2 mx-1 flex justify-between">
            Transcription
          </label>
          <div className="border border-bzinc rounded-md">
            <textarea className="w-full h-32 p-2 outline-none" rows={10} />
            <div className="border-t border-bzinc p-2 text-left flex justify-between items-center">
              <SubtitlesIcon size={18} />
              <div className="flex gap-2 items-center">
                Count: 100 words
                <XIcon size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
