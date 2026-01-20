import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/button";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";

import { format, isSameDay, subDays } from "date-fns";
import { Link, useSearch } from "@tanstack/react-router";
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

const ChatList = ({
  studentUserId,
  isStudent,
}: {
  studentUserId: string;
  isStudent: boolean;
}) => {
  const chatsQuery = useQuery(
    orpc.advisor.chatHistory.queryOptions({ input: { studentUserId } })
  );

  const searchParams = useSearch({ from: "/_authenticated/guru" });

  const chats = chatsQuery.data ?? [];

  return (
    <>
      {!isStudent ? (
        <div className="-translate-y-1">
          <Link
            to="/guru"
            search={{ userId: undefined }}
            className="flex gap-2 items-center"
          >
            <ArrowLeftIcon />
            <span className="text-zinc-500">Select a student</span>
          </Link>
          <hr className="mb-0 mt-3 border-zinc-200" />
        </div>
      ) : null}
      {chatsQuery.isPending ? (
        <div className="mt-2">
          <ChatLoader />
        </div>
      ) : null}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
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
                  className={cn(
                    "text-zinc-400 mb-2.5 text-xs font-medium uppercase tracking-wide",
                    {
                      "mt-3": title !== "Today",
                    }
                  )}
                >
                  {title}
                </div>
              ) : null}
              <Link
                to="/guru"
                search={{ chatId: c.id, userId: c.studentUserId }}
                className={cn(
                  "mb-2.5 block px-2 py-1.5 rounded-lg text-sm transition-all duration-150",
                  {
                    "font-semibold text-zinc-900 bg-[#BCFAF9]/30":
                      c.id === searchParams.chatId,
                    "text-zinc-700 hover:bg-zinc-50":
                      c.id !== searchParams.chatId,
                  }
                )}
              >
                <div className="truncate">{c.title}</div>
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
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        {!studentListQuery.isPending ? (
          <div className="text-zinc-400 mb-2.5">Select a student</div>
        ) : null}
        {studentList?.map((student) => {
          return (
            <>
              <Link
                to="/guru"
                search={{ userId: student.studentUserId }}
                className="mb-2.5 flex justify-between items-center group px-2 py-1.5 rounded-lg hover:bg-zinc-50 transition-all duration-150 min-w-0"
              >
                <div className="truncate text-sm text-zinc-700 group-hover:text-zinc-900 font-medium flex-1 min-w-0 mr-2">
                  {student.name}
                </div>
                <ArrowRightIcon className="size-4 text-zinc-400 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
              <div className="mb-2.5" />
            </>
          );
        })}
      </div>
    </>
  );
};

export const ChatHistory = ({
  studentUserId,
  userType,
}: {
  studentUserId?: string;
  userType: "ADMIN" | "ADVISOR" | "STUDENT";
}) => {
  const isStudent = userType === "STUDENT";

  return (
    <div className="border-r border-zinc-200 w-72 flex flex-col px-4 py-5 text-left bg-white flex-shrink-0 h-full overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-semibold text-zinc-900">Chat</div>
        <MagnifyingGlassIcon className="size-4 text-zinc-400" weight="bold" />
      </div>
      <Link to="/guru" className="w-full">
        <Button variant="primary" className="w-full text-xs justify-center">
          <PlusIcon className="size-3.5" />
          New Chat
          <SparkleIcon weight="fill" className="size-3.5" />
        </Button>
      </Link>

      <hr className="border-zinc-200 border-b border-t-0 my-4" />

      {studentUserId || userType === "STUDENT" ? (
        <ChatList studentUserId={studentUserId ?? ""} isStudent={isStudent} />
      ) : (
        <StudentList />
      )}
    </div>
  );
};
