import { createFileRoute, Link } from "@tanstack/react-router";

import {
  ArrowUpIcon,
  CaretDownIcon,
  SparkleIcon,
  CaretCircleRightIcon,
  ExportIcon,
  BrainIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/button";
import { UserSearch } from "@/features/user-search";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useForm } from "@tanstack/react-form";

import { UIMessage, useChat } from "@ai-sdk/react";

import { z } from "zod";
import { eventIteratorToStream } from "@orpc/client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { ChatHistory } from "@/features/chat-history";
import { AutosizeTextArea } from "@/features/autosize-text-area";
import { Markdown } from "@/components/markdown";
import { Loader } from "@/components/loader";
import { Tool } from "@/features/tools";
import { LoadingIndicator } from "@/components/loading-indicator";

export const Route = createFileRoute("/_authenticated/guru")({
  component: App,
  validateSearch: (search) =>
    z
      .object({ userId: z.string().optional(), chatId: z.string().optional() })
      .parse(search),
});

const EmptyMessage = ({ isStudent }: { isStudent: boolean }) => {
  return (
    <>
      <div className="size-16 rounded-full bg-gradient-to-br from-[#BCFAF9]/30 to-[#BCFAF9]/50 flex items-center justify-center mb-4">
        <BrainIcon className="size-8" weight="fill" style={{ color: '#BCFAF9', filter: 'brightness(0.7)' }} />
      </div>
      <div className="text-2xl font-semibold mb-2 mt-2 text-zinc-900">Hi, there 🎓</div>
      <div className="text-zinc-600">
        {isStudent
          ? "Ask me anything about your academic journey and college applications."
          : "Ask me questions about a user's sessions."}
      </div>
    </>
  );
};

const Message = ({
  role,
  message,
}: {
  role: "assistant" | "user" | "system";
  message: UIMessage;
}) => {
  const content = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  const tools = message.parts.filter((p) => p.type.startsWith("tool-"));

  return (
    <div
      className={cn(
        "py-3.5 px-4 rounded-xl text-left max-w-xl shadow-sm",
        "transition-all duration-200",
        role === "assistant"
          ? "mr-auto rounded-bl-none bg-white border border-zinc-100"
          : "ml-auto rounded-br-none bg-[#BCFAF9] text-zinc-900"
      )}
    >
      <Markdown>{content}</Markdown>
      {!content ? (
        <div className="flex gap-2">
          <LoadingIndicator />
        </div>
      ) : null}

      {tools.length ? (
        <>
          <hr className="my-4 border-bzinc" />

          <div className="space-x-2 space-y-2">
            {tools.map((t: any) => (
              <Tool
                input={t.input}
                output={t.output}
                key={t.toolCallId}
                type={t.type}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

function App() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const submitRef = useRef<HTMLButtonElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  // Get current user to check if they're a student
  const currentUserQuery = useQuery(orpc.user.current.queryOptions());
  const currentUser = currentUserQuery.data;

  // For students, automatically set userId to their own ID
  const userId = currentUser?.type === "STUDENT" ? currentUser.id : searchParams.userId;

  const queryClient = useQueryClient();

  const searchStudentMutation = useMutation(
    orpc.student.search.mutationOptions()
  );

  const newChatIdQuery = useQuery(orpc.chat.newId.queryOptions());

  const userDisplayQuery = useQuery(
    orpc.user.display.queryOptions({
      input: { userId: userId! },
      enabled: !!userId,
    })
  );

  const isNewChat = !searchParams.chatId;

  const chatId = searchParams.chatId ?? newChatIdQuery.data;

  const chatMessagesMutation = useMutation(
    orpc.advisor.chatMessages.mutationOptions({
      onSuccess: (data) => {
        chat.setMessages(
          data.messages.map((m) => {
            const toolParts: any = m.tools.map((t) => ({
              type: `tool-${t.toolName}`,
              toolCallId: t.toolCallId,
              input: t.input,
              output: t.output,
              state: "output-available",
            }));

            return {
              ...m,
              parts: [{ type: "text", text: m.content }, ...toolParts],
            };
          })
        );
      },
    })
  );

  const chat = useChat({
    id: !userId ? "select" : (chatId ?? "new") + userId,
    onFinish: async () => {
      if (isNewChat) {
        await queryClient.invalidateQueries({
          queryKey: orpc.advisor.chatHistory.key(),
        });
      }
    },
    transport: {
      sendMessages: async (options) => {
        return eventIteratorToStream(
          await orpc.chat.student.call(
            {
              studentUserId: userId!,
              messages: options.messages,
              chatId: chatId!,
            },
            { signal: options.abortSignal }
          )
        );
      },
      reconnectToStream: () => {
        throw new Error("Unsupported");
      },
    },
  });

  const isEmptyState = isNewChat && chat.messages.length === 0;

  const form = useForm({
    defaultValues: {
      studentQuery: "",
    },
  });

  const searchedStudents = searchStudentMutation.data ?? [];
  const userDisplay = userDisplayQuery.data;

  const isPendingOrError =
    chat.messages.length === 0 &&
    (chatMessagesMutation.isPending || chatMessagesMutation.isError);

  const isUserSelectionDisabled = chat.messages.length > 0;

  useEffect(() => {
    if (!isNewChat && searchParams.chatId) {
      chatMessagesMutation.mutate({ chatId: searchParams.chatId });
    }

    if (isNewChat) {
      searchStudentMutation.mutate({ query: "" });
      chat.setMessages([]);
    }
  }, [chatId, isNewChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length]);

  return (
    <div className="flex flex-1 h-screen overflow-hidden">
      <ChatHistory studentUserId={userId} />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <div className="justify-between items-center flex px-6 py-4 border-b border-zinc-200 bg-white flex-shrink-0">
          <div className="flex gap-2 items-center text-sm font-medium text-zinc-900">
            <CaretCircleRightIcon className="size-4 text-zinc-400" />
            {!isPendingOrError ? (
              isNewChat ? (
                "New Chat"
              ) : (
                chatMessagesMutation.data?.title
              )
            ) : (
              <Loader
                className="h-5 w-48"
                isError={chatMessagesMutation.isError}
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="neutral" className="text-xs">
              Share
              <ExportIcon className="size-3.5" />
            </Button>
            <Link to="/guru">
              <Button variant="primary" className="text-xs">
                New Chat
                <SparkleIcon weight="fill" className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-zinc-50 to-white overflow-hidden">
          <div className="max-w-3xl mx-auto w-full flex flex-col h-full px-6 py-6 overflow-hidden">
            <div
              className={cn(
                "flex-1 flex flex-col overflow-y-auto custom-scrollbar min-h-0",
                chat.messages.length ? "gap-4" : "items-center justify-center"
              )}
            >
              {isPendingOrError ? (
                <div className="space-y-4">
                  <Loader
                    className="w-72 rounded-lg rounded-br-none h-11 ml-auto"
                    isError={chatMessagesMutation.isError}
                  />
                  <Loader
                    className="w-[35rem] rounded-lg rounded-bl-none h-48"
                    isError={chatMessagesMutation.isError}
                  />
                </div>
              ) : null}
              {isEmptyState ? <EmptyMessage isStudent={currentUser?.type === "STUDENT"} /> : null}
              {chat.messages.map((msg) => (
                <Message key={msg.id} role={msg.role} message={msg} />
              ))}
              <div className="h-1" ref={bottomRef} />
            </div>
            <form
              className="flex-shrink-0 mt-4"
              onSubmit={(ev) => {
                ev.preventDefault();

                if (!userId) return;
                if (input.trim()) {
                  chat.sendMessage({ text: input });
                  setInput("");

                  navigate({ to: "/guru", search: { userId, chatId } });
                }
              }}
            >
              {isEmptyState && !!userId && userDisplay?.name ? (
                <div className="flex flex-col p-4 gap-4">
                  {[
                    `Where is ${userDisplay.name?.split(" ")[0]} in the application process?`,
                    "What should we prioritize in our next session?",
                    "What deadlines should we be aware of?",
                  ].map((text) => (
                    <div key={text}>
                      <button
                        type="button"
                        onClick={() => setInput(text)}
                        className="text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100 hover:border-zinc-300 transition-all duration-150"
                      >
                        {text}
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="rounded-xl bg-white p-4 border border-zinc-200 shadow-sm">
                <AutosizeTextArea
                  placeholder="Ask me anything..."
                  value={input}
                  onValueChange={setInput}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" && !ev.shiftKey) {
                      ev.preventDefault();
                      submitRef.current?.click();
                    }
                  }}
                  rows={3}
                />

                <div className="flex justify-between items-center mt-3 gap-3">
                  {currentUser?.type !== "STUDENT" && (
                    <form.Field
                      name="studentQuery"
                      asyncDebounceMs={300}
                      listeners={{
                        onChange: ({ value }) => {
                          searchStudentMutation.mutate({ query: value });
                        },
                      }}
                      children={(field) => (
                        <UserSearch
                          placeholder="Select student"
                          data={searchedStudents}
                          onSearch={field.handleChange}
                          isLoading={searchStudentMutation.isPending}
                          isTriggerDisabled={isUserSelectionDisabled}
                          onSelect={(user) => {
                            queryClient.setQueryData(
                              orpc.user.display.queryKey({
                                input: { userId: user.userId },
                              }),
                              () => ({ email: "xxx", name: user.name })
                            );

                            navigate({
                              to: "/guru",
                              search: { userId: user.userId },
                            });
                          }}
                          user={
                            userDisplay && userId
                              ? {
                                  userId,
                                  name: userDisplay.name,
                                }
                              : undefined
                          }
                          side="left"
                          align="end"
                          className="w-72 h-50"
                          trigger={(user) => (
                            <Button
                              type="button"
                              variant="neutral"
                              className="rounded-lg flex-shrink-0"
                            >
                              {user ? user.name : "Select a student"}
                              {isUserSelectionDisabled ? null : (
                                <CaretDownIcon weight="bold" />
                              )}
                            </Button>
                          )}
                        />
                      )}
                    />
                  )}

                  <Button
                    ref={submitRef}
                    type="submit"
                    disabled={!input.trim() || !userId}
                    className={cn("flex-shrink-0", currentUser?.type === "STUDENT" && "ml-auto")}
                  >
                    <ArrowUpIcon weight="bold" />
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
