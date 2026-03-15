import { Loader } from "@/components/loader";
import { Markdown } from "@/components/markdown";
import { cn } from "@/utils/cn";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc } from "orpc/client";

export const Route = createFileRoute("/_authenticated/visitors/$chatId")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const chatId = params.chatId;

  const messagesQuery = useQuery(
    orpc.visitorChat.messages.queryOptions({ input: { chatId } }),
  );

  const visitorsQuery = useQuery(orpc.visitorChat.list.queryOptions());
  const visitor = visitorsQuery.data?.find((v) => v.id === chatId);

  const messages = messagesQuery.data ?? [];

  return (
    <div className="w-[30rem] bg-white border-l border-bzinc flex flex-col h-screen text-left">
      <div className="p-4 pt-5 border-b border-bzinc flex gap-4 items-center">
        <Link to="/visitors">
          <ArrowLeftIcon />
        </Link>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-zinc-900 truncate">
            {visitor?.fullName ?? "Visitor"}
          </span>
          <span className="text-xs text-zinc-500 truncate">
            {visitor?.email}
            {visitor?.phone ? ` · ${visitor.phone}` : ""}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messagesQuery.isLoading ? (
          <div className="space-y-3">
            <Loader className="w-48 h-10 rounded-lg rounded-br-none ml-auto" />
            <Loader className="w-72 h-24 rounded-lg rounded-bl-none" />
            <Loader className="w-40 h-10 rounded-lg rounded-br-none ml-auto" />
            <Loader className="w-64 h-32 rounded-lg rounded-bl-none" />
          </div>
        ) : null}

        {messagesQuery.isError ? (
          <div className="text-sm text-red-500 text-center py-8">
            Failed to load messages.
          </div>
        ) : null}

        {!messagesQuery.isLoading && messages.length === 0 ? (
          <div className="text-sm text-zinc-400 text-center py-8">
            No messages yet.
          </div>
        ) : null}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "py-2.5 px-3 rounded-xl text-sm shadow-sm max-w-[85%]",
              msg.role === "assistant"
                ? "mr-auto rounded-bl-none bg-zinc-50 border border-zinc-100"
                : "ml-auto rounded-br-none bg-violet-100 text-zinc-900 text-right",
            )}
          >
            <Markdown className="text-sm">{msg.content}</Markdown>
          </div>
        ))}
      </div>
    </div>
  );
}
