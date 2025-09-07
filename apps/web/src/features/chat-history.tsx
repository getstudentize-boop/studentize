import {
  MagnifyingGlassIcon,
  PlusIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/button";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";

import { differenceInDays, format } from "date-fns";
import { Link, useSearch } from "@tanstack/react-router";
import { cn } from "@/utils/cn";

export const ChatHistory = () => {
  const chatsQuery = useQuery(orpc.advisor.chatHistory.queryOptions());

  const searchParams = useSearch({ from: "/" });

  const chats = chatsQuery.data ?? [];

  return (
    <div className="border-r border-zinc-100 w-56 flex flex-col pr-4 py-[1.7rem] text-left">
      <div className="flex justify-between items-center">
        <div>Chat</div>
        <MagnifyingGlassIcon className="size-3.5 text-zinc-600" weight="bold" />
      </div>
      <Link to="/">
        <Button className="my-4 w-full">
          <PlusIcon />
          New Chat
          <SparkleIcon weight="fill" />
        </Button>
      </Link>

      <hr className="border-bzinc border-b border-t-0 mb-4" />

      {chats.map((c, idx) => {
        const prevChat = chats[idx - 1];
        const days = prevChat
          ? differenceInDays(
              c.createdAt ?? new Date(),
              prevChat.createdAt ?? new Date()
            )
          : 0;

        const isTitle = days > 0 || !prevChat;

        const title = isTitle
          ? days === 0
            ? "Today"
            : days === 1
              ? "Yesterday"
              : format(c.createdAt ?? new Date(), "E DD MMM")
          : undefined;

        return (
          <>
            {title ? <div className="text-zinc-400 mb-2.5">{title}</div> : null}
            <Link
              to="/"
              search={{ chatId: c.id, userId: searchParams.userId }}
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
