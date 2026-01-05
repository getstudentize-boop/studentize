import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/button";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";

import { format, isSameDay, subDays } from "date-fns";
import {
  Link,
  useCanGoBack,
  useRouter,
  useSearch,
} from "@tanstack/react-router";
import { cn } from "@/utils/cn";

const ChatLoader = () => {
  return (
    <div>
      <div className="h-5 bg-zinc-200 animate-pulse rounded-sm w-14 mb-4" />
      {Array.from({ length: 5 }).map((_, idx) => (
        <div className="h-5 bg-zinc-200 animate-pulse w-full rounded-sm mb-2" />
      ))}
    </div>
  );
};

const ChatList = ({ studentUserId }: { studentUserId: string }) => {
  const chatsQuery = useQuery(
    orpc.advisor.chatHistory.queryOptions({ input: { studentUserId } })
  );

  const searchParams = useSearch({ from: "/_authenticated/guru" });

  const chats = chatsQuery.data ?? [];

  return (
    <>
      <div className="-translate-y-1">
        <Link
          to="/guru"
          search={{ userId: undefined }}
          className="flex gap-2 items-center"
        >
          <ArrowLeftIcon />
          <span className="text-zinc-500">Select a student</span>
        </Link>
        <hr className="mb-0 mt-3 border-bzinc" />
      </div>
      {chatsQuery.isPending ? (
        <div className="mt-2">
          <ChatLoader />
        </div>
      ) : null}
      <div className="h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar pr-1">
        {chats.map((c, idx) => {
          const prevChat = chats[idx - 1];
          const isDifferentDay = prevChat
            ? !isSameDay(
                c.createdAt ?? new Date(),
                prevChat.createdAt ?? new Date()
              )
            : true; // First chat is always a different "day"

          const isTitle = isDifferentDay;

          const now = new Date();
          const yesterday = subDays(now, 1);
          const chatDate = c.createdAt ?? new Date();

          const title = isTitle
            ? isSameDay(chatDate, now)
              ? "Today"
              : isSameDay(chatDate, yesterday)
                ? "Yesterday"
                : format(chatDate, "E dd MMM")
            : undefined;

          return (
            <>
              {title ? (
                <div
                  className={cn("text-zinc-400 mb-2.5", {
                    "mt-2": title !== "Today",
                  })}
                >
                  {title}
                </div>
              ) : null}
              <Link
                to="/guru"
                search={{ chatId: c.id, userId: c.studentUserId }}
                className={cn("mb-2.5", {
                  "font-semibold text-cyan-600 transition-transform":
                    c.id === searchParams.chatId,
                })}
              >
                <div className="w-52 truncate">{c.title}</div>
              </Link>
              <div className="mb-2.5" />
            </>
          );
        })}
      </div>
    </>
  );
};

export const StudentList = () => {
  const studentListQuery = useQuery(
    orpc.advisor.getStudentList.queryOptions({})
  );

  const studentList = studentListQuery.data ?? [];

  return (
    <>
      {studentListQuery.isPending ? <ChatLoader /> : null}
      <div className="h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar pr-1">
        {!studentListQuery.isPending ? (
          <div className="text-zinc-400 mb-2.5">Select a student</div>
        ) : null}
        {studentList?.map((student) => {
          return (
            <>
              <Link
                to="/guru"
                search={{ userId: student.studentUserId }}
                className="mb-2.5 flex justify-between items-center group"
              >
                <div className="w-52 truncate group-hover:translate-x-1 transition-transform">
                  {student.name}
                </div>
                <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="mb-2.5" />
            </>
          );
        })}
      </div>
    </>
  );
};

export const ChatHistory = ({ studentUserId }: { studentUserId?: string }) => {
  const router = useRouter();
  const isCanGoBack = useCanGoBack();

  return (
    <div className="border-r border-zinc-100 w-56 flex flex-col pr-4 py-[1.7rem] text-left ml-4">
      <div className="flex justify-between items-center">
        <button
          className="flex items-center gap-2"
          onClick={() => {
            if (isCanGoBack) {
              router.history.back();
            }
          }}
        >
          {isCanGoBack ? <CaretLeftIcon /> : null}
          <div>Chat</div>
        </button>
        <MagnifyingGlassIcon className="size-3.5 text-zinc-600" weight="bold" />
      </div>
      <Link to="/guru">
        <Button className="my-4 w-full">
          <PlusIcon />
          New Chat
          <SparkleIcon weight="fill" />
        </Button>
      </Link>

      <hr className="border-bzinc border-b border-t-0 mb-4" />

      {studentUserId ? (
        <ChatList studentUserId={studentUserId} />
      ) : (
        <StudentList />
      )}
    </div>
  );
};
