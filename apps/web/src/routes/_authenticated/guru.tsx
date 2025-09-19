import { createFileRoute, Link } from "@tanstack/react-router";

import {
  ArrowUpIcon,
  CaretDownIcon,
  SparkleIcon,
  CaretCircleRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ExportIcon,
  FileMagnifyingGlassIcon,
  UserIcon,
  UserSquareIcon,
  SubtitlesIcon,
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

export const Route = createFileRoute("/_authenticated/guru")({
  component: App,
  validateSearch: (search) =>
    z
      .object({ userId: z.string().optional(), chatId: z.string().optional() })
      .parse(search),
});

const EmptyMessage = () => {
  return (
    <>
      <div className="size-14 rounded-full bg-gradient-to-tl to-violet-100 from-sky-600" />
      <div className="text-2xl font-semibold mb-1 mt-5">Hi, there 🎓</div>
      <div>Ask me questions about a user's sessions.</div>
    </>
  );
};

const Tool = ({ type }: { type: string }) => {
  switch (type) {
    case "tool-searchSessionTranscriptions":
      return (
        <div className="rounded-md shadow-sm outline outline-bzinc py-1 px-2 inline-flex gap-2 items-center">
          <FileMagnifyingGlassIcon />
          <div>Session Transcription</div>
        </div>
      );
    case "tool-studentInfo":
      return (
        <div className="rounded-md shadow-sm outline outline-bzinc py-1 px-2 inline-flex gap-2 items-center">
          <UserSquareIcon />
          <div>Student Bio</div>
        </div>
      );
    case "tool-sessionSummary":
      return (
        <div className="rounded-md shadow-sm outline outline-bzinc py-1 px-2 inline-flex gap-2 items-center">
          <SubtitlesIcon />
          <div>Session Summary</div>
        </div>
      );
    default:
      return null;
  }
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
        "py-3 px-4 rounded-xl text-left max-w-xl",
        role === "assistant"
          ? "mr-auto rounded-bl-none bg-white"
          : "ml-auto rounded-br-none bg-linear-to-t to-cyan-600 from-cyan-700/80 text-white"
      )}
    >
      <Markdown>{content}</Markdown>

      {tools.length ? (
        <>
          <hr className="my-4 border-bzinc" />

          <div className="space-x-2 space-y-2">
            {tools.map((t: any) => (
              <Tool key={t.toolCallId} type={t.type} />
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
  const [input, setInput] = useState("");

  const userId = searchParams.userId;

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
    id: !userId ? "select" : (chatId ?? "new"),
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

  useEffect(() => {
    if (!isNewChat && chatId) {
      chatMessagesMutation.mutate({ chatId });
    }

    if (isNewChat) {
      searchStudentMutation.mutate({ query: "" });
      chat.setMessages([]);
    }
  }, [chatId, isNewChat]);

  return (
    <>
      <ChatHistory />
      <div className="flex flex-1 flex-col p-4 pt-2.5 h-screen">
        <div className="justify-between items-center flex p-2.5">
          <div className="flex gap-2 items-center">
            <CaretCircleRightIcon className="size-[1.1rem]" />
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
            <Button variant="neutral">
              Share
              <ExportIcon />
            </Button>
            <Link to="/guru">
              <Button>
                New Chat
                <SparkleIcon weight="fill" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 h-[90vh] rounded-lg bg-gradient-to-b from-zinc-100/80 to-zinc-100 p-10 pt-0">
          <div className="max-w-3xl mx-auto w-full flex flex-col h-full relative">
            <div
              className={cn(
                "flex-1 flex flex-col px-4 pt-10 pb-36 overflow-y-auto no-scrollbar",
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
              {isEmptyState ? <EmptyMessage /> : null}
              {chat.messages.map((msg) => (
                <Message key={msg.id} role={msg.role} message={msg} />
              ))}
            </div>
            <form
              className={cn(
                "transition-transform duration-500 ease-in-out absolute bottom-0 left-0 w-full",
                !isEmptyState ? "translate-y-5" : undefined
              )}
              onSubmit={(ev) => {
                ev.preventDefault();
                if (input.trim()) {
                  chat.sendMessage({ text: input });
                  setInput("");

                  navigate({ to: "/guru", search: { userId, chatId } });
                }
              }}
            >
              <div className="rounded-2xl bg-white p-4 outline-[1px] outline-zinc-100 shadow-xs">
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

                <div className="flex justify-between">
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
                          <Button variant="neutral" className="rounded-lg">
                            {user ? user.name : "Select a student"}
                            <CaretDownIcon weight="bold" />
                          </Button>
                        )}
                      />
                    )}
                  />

                  <Button
                    ref={submitRef}
                    type="submit"
                    disabled={!input.trim() || !userId}
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
    </>
  );
}
