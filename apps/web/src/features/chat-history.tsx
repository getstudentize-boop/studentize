import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/button";
import { InlineLoader } from "@/components/page-loader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";

import { format, isSameDay, subDays } from "date-fns";
import { Link, useSearch } from "@tanstack/react-router";
import { cn } from "@/utils/cn";
import { useEffect, useMemo, useState } from "react";

const ChatList = ({
  studentUserId,
  isStudent,
  searchQuery,
}: {
  studentUserId: string;
  isStudent: boolean;
  searchQuery: string;
}) => {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const chatsQuery = useQuery(
    orpc.advisor.chatHistory.queryOptions({ input: { studentUserId } })
  );

  const searchChatsQuery = useQuery(
    orpc.advisor.searchChats.queryOptions({
      input: { studentUserId, query: debouncedQuery },
      enabled: !!debouncedQuery.trim(),
    })
  );

  const searchParams = useSearch({ from: "/_authenticated/guru" });

  const allChats = chatsQuery.data ?? [];
  const searchResults = searchChatsQuery.data ?? [];

  const chats = debouncedQuery.trim() ? searchResults : allChats;
  const isSearchPending = searchQuery.trim() && (searchChatsQuery.isPending || searchQuery !== debouncedQuery);

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
      {(chatsQuery.isPending || isSearchPending) ? (
        <InlineLoader />
      ) : null}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        {searchQuery.trim() && chats.length === 0 && !isSearchPending ? (
          <div className="text-sm text-zinc-400 text-center py-4">
            No chats found
          </div>
        ) : null}
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
  const [showAllStudents, setShowAllStudents] = useState(false);

  const studentListQuery = useQuery(
    orpc.advisor.getStudentList.queryOptions({})
  );

  const allStudents = studentListQuery.data ?? [];

  const studentList = useMemo(() => {
    if (showAllStudents) {
      return allStudents;
    }
    return allStudents.filter((s) => s.status === "ACTIVE" || !s.status);
  }, [allStudents, showAllStudents]);

  const inactiveCount = allStudents.filter((s) => s.status === "INACTIVE").length;

  return (
    <>
      {studentListQuery.isPending ? <InlineLoader /> : null}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        {!studentListQuery.isPending ? (
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-zinc-400">Select a student</span>
            {inactiveCount > 0 && (
              <button
                onClick={() => setShowAllStudents(!showAllStudents)}
                className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${
                  showAllStudents
                    ? "bg-zinc-100 border-zinc-300 text-zinc-700"
                    : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {showAllStudents ? "Active only" : `+${inactiveCount}`}
              </button>
            )}
          </div>
        ) : null}
        {studentList?.map((student) => {
          return (
            <div key={student.studentUserId}>
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
            </div>
          );
        })}
      </div>
    </>
  );
};

export const ChatHistory = ({
  studentUserId,
  userRole,
}: {
  studentUserId?: string;
  userRole: "OWNER" | "ADMIN" | "ADVISOR" | "STUDENT";
}) => {
  const isStudent = userRole === "STUDENT";
  const queryClient = useQueryClient();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const showSearch = studentUserId || userRole === "STUDENT";

  return (
    <div className="border-r border-zinc-200 w-72 flex flex-col px-4 py-5 text-left bg-white flex-shrink-0 h-full overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        {isSearching ? (
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-zinc-400"
            onBlur={() => {
              if (!searchQuery) setIsSearching(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchQuery("");
                setIsSearching(false);
              }
            }}
          />
        ) : (
          <div className="text-sm font-semibold text-zinc-900">Chat</div>
        )}
        {showSearch && (
          <button
            onClick={() => {
              if (isSearching) {
                setSearchQuery("");
                setIsSearching(false);
              } else {
                setIsSearching(true);
              }
            }}
            className={cn(
              "p-1 rounded transition-colors",
              isSearching
                ? "text-zinc-900 hover:bg-zinc-100"
                : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <MagnifyingGlassIcon className="size-4" weight="bold" />
          </button>
        )}
      </div>
      <Link
        to="/guru"
        className="w-full"
        onClick={() =>
          queryClient.invalidateQueries({
            queryKey: orpc.chat.newId.key(),
          })
        }
      >
        <Button variant="primary" className="w-full text-xs justify-center">
          <PlusIcon className="size-3.5" />
          New Chat
          <SparkleIcon weight="fill" className="size-3.5" />
        </Button>
      </Link>

      <hr className="border-zinc-200 border-b border-t-0 my-4" />

      {studentUserId || userRole === "STUDENT" ? (
        <ChatList studentUserId={studentUserId ?? ""} isStudent={isStudent} searchQuery={searchQuery} />
      ) : (
        <StudentList />
      )}
    </div>
  );
};
