import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../../orpc/client";
import { XIcon } from "@phosphor-icons/react";

export const Route = createFileRoute("/guru/$chatSessionId")({
  component: ChatSession,
});

function ChatSession() {
  const { chatSessionId } = Route.useParams();
  const { data, isLoading } = useQuery(
    orpc.guruChatMessages.queryOptions({
      input: { chatId: chatSessionId },
    }),
  );

  return (
    <div className="w-140 shrink-0 border-l border-zinc-200 bg-white flex flex-col h-screen ">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
        <div className="min-w-0">
          {isLoading ? (
            <div className="h-4 w-40 animate-pulse rounded bg-zinc-100" />
          ) : data ? (
            <>
              <h2 className="truncate text-sm font-semibold text-zinc-900">
                {data.title}
              </h2>
              <p className="text-xs text-zinc-400">
                {data.studentName ?? "Unknown"} &middot; {data.studentEmail}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-400">Chat not found</p>
          )}
        </div>
        <Link
          to="/guru"
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
        >
          <XIcon className="size-4" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-12 w-3/4 animate-pulse rounded-xl bg-zinc-100 ${i % 2 === 1 ? "ml-auto" : ""}`}
              />
            ))}
          </div>
        ) : data?.messages.length === 0 ? (
          <p className="text-center text-sm text-zinc-400 py-12">
            No messages in this conversation
          </p>
        ) : (
          data?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-700"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
