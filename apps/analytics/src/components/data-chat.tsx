import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import { cn } from "#/utils/cn";
import { Markdown } from "#/components/markdown";
import { eventIteratorToStream } from "@orpc/client";
import { client } from "../../orpc/client";
import {
  PaperPlaneRightIcon,
  SparkleIcon,
  DatabaseIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";

export function DataChat() {
  const chat = useChat({
    transport: {
      sendMessages: async (options) => {
        return eventIteratorToStream(
          await client.chat({
            messages: options.messages,
          }),
        );
      },
      reconnectToStream: () => {
        throw new Error("Unsupported");
      },
    },
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isLoading = chat.status === "streaming" || chat.status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages]);

  const handleSubmit = (text: string) => {
    if (!text.trim() || isLoading) return;
    chat.sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex sticky top-0 h-full w-140 flex-col border-l border-zinc-200 bg-white">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
        <DatabaseIcon className="size-4 text-zinc-500" weight="fill" />
        <h2 className="text-sm font-semibold text-zinc-900">Data Assistant</h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {chat.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100">
              <SparkleIcon className="size-6 text-zinc-400" weight="fill" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">
                Ask about your data
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                I can query the database to answer questions about students,
                advisors, colleges, sessions, and more.
              </p>
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {[
                "How many active students do we have?",
                "Which colleges are most shortlisted?",
                "Average session rating this month?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-left text-xs text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chat.messages.map((message) => (
              <div key={message.id}>
                {message.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-zinc-900 px-3 py-2 text-xs text-white">
                      {message.parts
                        .map((p) => (p.type === "text" ? p.text : ""))
                        .join("")}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                      <SparkleIcon
                        className="size-3 text-zinc-500"
                        weight="fill"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      {message.parts.map((part, i) => {
                        if (part.type === "text") {
                          return (
                            <Markdown key={i} className="text-xs text-zinc-700">
                              {part.text}
                            </Markdown>
                          );
                        }

                        if (part.type.startsWith("tool-")) {
                          const toolPart = part as any;
                          return (
                            <div
                              key={i}
                              className="my-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5"
                            >
                              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                <DatabaseIcon
                                  className="size-3"
                                  weight="fill"
                                />
                                {toolPart.output ? (
                                  <span>
                                    Query returned{" "}
                                    {toolPart.output?.rowCount ?? 0} rows
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <CircleNotchIcon className="size-3 animate-spin" />
                                    Running query...
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading &&
              chat.messages[chat.messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2 items-center">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                    <CircleNotchIcon className="size-3 animate-spin text-zinc-500" />
                  </div>
                  <span className="text-xs text-zinc-400">Thinking...</span>
                </div>
              )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(input);
        }}
        className="border-t border-zinc-200 px-3 py-3"
      >
        <div className="flex items-end gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-zinc-300 focus-within:bg-white">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(input);
              }
            }}
            placeholder="Ask about your data..."
            rows={1}
            className="max-h-24 -translate-y-1 flex-1 resize-none bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-lg transition-colors",
              input.trim() && !isLoading
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "text-zinc-300",
            )}
          >
            <PaperPlaneRightIcon className="size-3.5" weight="fill" />
          </button>
        </div>
      </form>
    </div>
  );
}
