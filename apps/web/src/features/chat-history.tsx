import {
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

export const ChatHistory = () => {
  const chatsQuery = useQuery(orpc.advisor.chatHistory.queryOptions());

  const searchParams = useSearch({ from: "/_authenticated/guru" });

  const chats = chatsQuery.data ?? [];

  return (
    <div className="border-r border-zinc-100 w-56 flex flex-col pr-4 py-[1.7rem] text-left">
      <div className="flex justify-between items-center">
        <div>Chat</div>
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
              className={cn("truncate mb-2.5", {
                "font-semibold text-cyan-900 transition-all":
                  c.id === searchParams.chatId,
              })}
            >
              {c.title}
            </Link>
          </>
        );
      })}
    </div>
  );
};
