import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpIcon,
  BrainIcon,
  ChatCircle,
  XIcon,
} from "@phosphor-icons/react";
import { z } from "zod";
import { UIMessage, useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";

import { Popover } from "@/components/popover";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Markdown } from "@/components/markdown";
import { LoadingIndicator } from "@/components/loading-indicator";
import { orpc } from "orpc/client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

type VisitorInfo = {
  fullName: string;
  email: string;
  phone: string;
};

const ChatMessage = ({
  role,
  message,
}: {
  role: "assistant" | "user" | "system";
  message: UIMessage;
}) => {
  const content = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  return (
    <div
      className={cn(
        "py-2.5 px-3 rounded-xl text-left text-sm shadow-sm",
        "transition-all duration-200",
        role === "assistant"
          ? "mr-auto rounded-bl-none bg-white border border-zinc-100"
          : "ml-auto rounded-br-none bg-violet-100 text-zinc-900"
      )}
    >
      <Markdown className="text-sm">{content}</Markdown>
      {!content ? (
        <div className="flex gap-2">
          <LoadingIndicator />
        </div>
      ) : null}
    </div>
  );
};

const InfoForm = ({
  onSubmit,
}: {
  onSubmit: (info: VisitorInfo) => void;
}) => {
  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
    validators: {
      onSubmit: z.object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.email("Invalid email address"),
        phone: z.string().min(1, "Phone number is required"),
      }),
    },
    onSubmit: (vals) => {
      onSubmit({
        fullName: vals.value.fullName,
        email: vals.value.email,
        phone: vals.value.phone,
      });
    },
  });

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        form.handleSubmit(ev);
      }}
      className="flex flex-col gap-4 p-4"
    >
      <form.Field
        name="fullName"
        children={(field) => (
          <div className="space-y-1">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-zinc-700"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              id={field.name}
              name={field.name}
              placeholder="Enter your full name"
              value={field.state.value}
              onChange={(ev) => field.handleChange(ev.target.value)}
              className={cn(
                field.state.meta.errors?.[0] &&
                  "border-red-500 focus:ring-red-500"
              )}
            />
            {field.state.meta.errors?.[0] && (
              <p className="text-xs text-red-500">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      />
      <form.Field
        name="email"
        children={(field) => (
          <div className="space-y-1">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-zinc-700"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              placeholder="your.email@example.com"
              value={field.state.value}
              onChange={(ev) => field.handleChange(ev.target.value)}
              className={cn(
                field.state.meta.errors?.[0] &&
                  "border-red-500 focus:ring-red-500"
              )}
            />
            {field.state.meta.errors?.[0] && (
              <p className="text-xs text-red-500">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      />
      <form.Field
        name="phone"
        children={(field) => (
          <div className="space-y-1">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-zinc-700"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              id={field.name}
              name={field.name}
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={field.state.value}
              onChange={(ev) => field.handleChange(ev.target.value)}
              className={cn(
                field.state.meta.errors?.[0] &&
                  "border-red-500 focus:ring-red-500"
              )}
            />
            {field.state.meta.errors?.[0] && (
              <p className="text-xs text-red-500">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-700 hover:to-violet-800 focus:ring-violet-500"
      >
        <ChatCircle className="size-5" weight="fill" />
        Start Chat with Expert
      </Button>

      <p className="text-center text-xs text-zinc-500">
        Your information is secure and will only be used to provide personalized
        guidance.
      </p>
    </form>
  );
};

const ChatView = ({ visitor }: { visitor: VisitorInfo }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const [input, setInput] = useState("");

  const newChatIdQuery = useQuery(orpc.visitorChat.newId.queryOptions());
  const chatId = newChatIdQuery.data;

  const chat = useChat({
    id: chatId ? `visitor-${chatId}` : "visitor-new",
    transport: {
      sendMessages: async (options) => {
        return eventIteratorToStream(
          await orpc.visitorChat.chat.call(
            {
              chatId: chatId!,
              fullName: visitor.fullName,
              email: visitor.email,
              phone: visitor.phone,
              messages: options.messages,
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length]);

  const isEmpty = chat.messages.length === 0;

  return (
    <div className="flex flex-col h-[28rem]">
      <div
        className={cn(
          "flex-1 overflow-y-auto p-4 min-h-0",
          isEmpty ? "flex flex-col items-center justify-center" : "space-y-3"
        )}
      >
        {isEmpty ? (
          <>
            <div className="size-12 rounded-full bg-violet-100 flex items-center justify-center mb-3">
              <BrainIcon
                className="size-6"
                weight="fill"
                style={{ color: "#7c3aed" }}
              />
            </div>
            <p className="text-sm font-medium text-zinc-900">
              Hi, {visitor.fullName.split(" ")[0]}!
            </p>
            <p className="text-xs text-zinc-500 text-center">
              Ask me anything about Studentize or your university journey.
            </p>
          </>
        ) : (
          chat.messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-zinc-200 p-3 flex gap-2 items-end flex-shrink-0"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (input.trim() && chatId) {
            chat.sendMessage({ text: input });
            setInput("");
          }
        }}
      >
        <textarea
          placeholder="Ask me anything..."
          value={input}
          onChange={(ev) => setInput(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" && !ev.shiftKey) {
              ev.preventDefault();
              submitRef.current?.click();
            }
          }}
          rows={1}
          className="flex-1 resize-none text-sm outline-none min-h-8 max-h-24 text-zinc-900 placeholder:text-zinc-400"
        />
        <Button
          ref={submitRef}
          type="submit"
          disabled={!input.trim() || !chatId}
          className="flex-shrink-0 size-8 !p-0"
        >
          <ArrowUpIcon weight="bold" className="size-3.5" />
        </Button>
      </form>
    </div>
  );
};

export const SpeakToAdvisor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visitor, setVisitor] = useState<VisitorInfo | null>(null);

  return (
    <Popover
      trigger={
        <button
          type="button"
          aria-label="Speak to a Virtual Advisor"
          className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg transition-colors hover:bg-cyan-500"
        >
          <ChatCircle className="size-4" weight="fill" />
        </button>
      }
      open={isOpen}
      onOpenChange={setIsOpen}
      side="top"
      align="end"
      className="w-96 max-w-[calc(100vw-2rem)] overflow-hidden p-0"
    >
      <div className="relative flex flex-col">
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 px-6 pt-6 pb-4 text-center">
          <div className="flex items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
              className="flex size-8 items-center justify-center rounded-full border-2 border-white/60 text-white transition-colors hover:bg-white/20"
            >
              <XIcon className="size-4" weight="bold" />
            </button>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            Welcome to Studentize!
          </h2>
          <p className="mt-1 text-sm text-violet-100">
            {visitor
              ? "Ask us anything about your university journey"
              : "Let's get started with your university journey"}
          </p>
        </div>

        {visitor ? (
          <ChatView visitor={visitor} />
        ) : (
          <InfoForm onSubmit={setVisitor} />
        )}
      </div>
    </Popover>
  );
};
