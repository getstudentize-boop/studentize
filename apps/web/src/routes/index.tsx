import { createFileRoute, Link } from "@tanstack/react-router";

import {
  ArrowUpIcon,
  CaretDownIcon,
  SparkleIcon,
  CaretCircleRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ExportIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/button";
import { UserSearch } from "@/features/user-search";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useForm } from "@tanstack/react-form";

import { useChat } from "@ai-sdk/react";

import { z } from "zod";
import { eventIteratorToStream } from "@orpc/client";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { ChatHistory } from "@/features/chat-history";
import { newChatId } from "node_modules/@student/api/src/routes/chat/new-id";

export const Route = createFileRoute("/")({
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

const Message = ({
  role,
  children,
}: {
  role: "assistant" | "user" | "system";
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "py-3 px-4 rounded-xl text-left max-w-xl",
        role === "assistant"
          ? "mr-auto rounded-bl-none bg-white"
          : "ml-auto rounded-br-none bg-linear-to-t to-cyan-600 from-cyan-700/80 text-white"
      )}
    >
      {children}
    </div>
  );
};

function App() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

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
          data.messages.map((m) => ({
            ...m,
            parts: [{ type: "text", text: m.content }],
          }))
        );
      },
    })
  );

  const chat = useChat({
    id: chatId ?? "new",
    onFinish: async () => {
      if (isNewChat) {
        await queryClient.invalidateQueries({
          queryKey: orpc.advisor.chatHistory.key(),
        });

        navigate({ to: "/", search: { userId, chatId } });
      }
    },
    transport: {
      sendMessages: async (options) => {
        return eventIteratorToStream(
          await orpc.chat.student.call(
            {
              advisorUserId: "1",
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

  const form = useForm({
    defaultValues: {
      studentQuery: "",
    },
  });

  const searchedStudents = searchStudentMutation.data ?? [];
  const userDisplay = userDisplayQuery.data;

  useEffect(() => {
    if (!isNewChat && chatId) {
      chatMessagesMutation.mutate({ chatId });
    }
  }, [chatId, isNewChat]);

  return (
    <>
      <ChatHistory />
      <div className="flex flex-1 flex-col p-4 pt-2.5 h-screen">
        <div className="justify-between items-center flex p-2.5">
          <div className="flex gap-2 items-center">
            <CaretCircleRightIcon className="size-[1.1rem]" />
            Guru
          </div>

          <div className="flex gap-2">
            <Button variant="neutral">
              Share
              <ExportIcon />
            </Button>
            <Link to="/">
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
              {!chatId || chat.messages.length > 0 ? null : <EmptyMessage />}
              {chat.messages.map((msg) => (
                <Message key={msg.id} role={msg.role}>
                  {msg.parts.map((part, index) =>
                    part.type === "text" ? (
                      <span key={index}>{part.text}</span>
                    ) : null
                  )}
                </Message>
              ))}
            </div>
            <form
              className={cn(
                "transition-transform duration-500 ease-in-out absolute bottom-0 left-0 w-full",
                chat.messages.length > 0 ? "translate-y-5" : undefined
              )}
              onSubmit={(ev) => {
                ev.preventDefault();
                if (input.trim()) {
                  chat.sendMessage({ text: input });
                  setInput("");
                }
              }}
            >
              <div className="rounded-2xl bg-white p-4 outline-[1px] outline-zinc-100 shadow-xs">
                <textarea
                  placeholder="Ask me anything..."
                  className="w-full outline-none resize-none"
                  onChange={(ev) => setInput(ev.target.value)}
                  value={input}
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
                        placeholder="Select session"
                        data={searchedStudents}
                        onSearch={field.handleChange}
                        onSelect={(user) => {
                          queryClient.setQueryData(
                            orpc.user.display.queryKey({
                              input: { userId: user.userId },
                            }),
                            () => ({ email: "xxx", name: user.name })
                          );

                          navigate({
                            to: "/",
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

                  <Button type="submit" disabled={!input.trim() || !userId}>
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
