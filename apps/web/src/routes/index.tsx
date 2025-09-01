import { createFileRoute } from "@tanstack/react-router";

import {
  ArrowUpIcon,
  CaretDownIcon,
  SparkleIcon,
  CaretCircleRightIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/button";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="flex flex-1 flex-col p-4 h-screen">
      <div className="justify-between items-center flex p-2.5">
        <div className="flex gap-2 items-center">
          <CaretCircleRightIcon className="size-4" />
          Guru AI
        </div>

        <div className="px-3 py-1.5 shadow border-b-2 border-zinc-950 flex gap-2 rounded-full text-white bg-zinc-800 items-center">
          New Chat
          <SparkleIcon weight="fill" />
        </div>
      </div>
      <div className="flex-1 rounded-md bg-gradient-to-b from-zinc-100/80 to-zinc-100 p-10">
        <div className="max-w-3xl mx-auto w-full flex flex-col h-full justify-end">
          <div className="flex-1 items-center justify-center flex flex-col">
            <div className="size-14 rounded-full bg-gradient-to-tl to-violet-100 from-sky-600" />
            <div className="text-2xl font-semibold mb-1 mt-5">Hi, there 🎓</div>
            <div>Ask me questions about a user's sessions.</div>
          </div>
          <div className="rounded-2xl bg-white p-4 outline-[1px] outline-zinc-100 shadow-xs">
            <textarea
              placeholder="Ask me anything..."
              className="w-full outline-none resize-none"
              rows={3}
            />

            <div className="flex justify-between">
              <button className="px-3 py-1.5 border-b-2 border border-zinc-100 border-b-zinc-200 flex gap-2 rounded-full items-center">
                Mike Testing
                <CaretDownIcon weight="bold" size={12} />
              </button>

              <Button>
                <ArrowUpIcon weight="bold" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
