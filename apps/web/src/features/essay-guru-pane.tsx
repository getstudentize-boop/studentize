import { useEffect, useRef, useState } from "react";
import { UIMessage, useChat } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { eventIteratorToStream } from "@orpc/client";
import { useAuthUser } from "@/routes/_authenticated";
import { AutosizeTextArea } from "@/features/autosize-text-area";
import { Markdown } from "@/components/markdown";
import { LoadingIndicator } from "@/components/loading-indicator";
import {
  ArrowUpIcon,
  BrainIcon,
  CaretCircleRightIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "@/utils/cn";

interface EssayGuruPaneProps {
  essayTitle: string;
  essayPrompt: string;
  onClose: () => void;
  essayContent: string;
}

const SUGGESTED_QUESTIONS = [
  "What are some unique angles I could take for this topic?",
  "What questions should I ask myself before writing?",
  "What themes do admissions officers look for in essays like this?",
  "How can I make my opening sentence stand out?",
  "What common mistakes should I avoid?",
];

function SidebarMessage({ message }: { message: UIMessage }) {
  const content = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  return (
    <div
      className={cn(
        "py-2.5 px-3 rounded-lg text-left text-sm",
        message.role === "assistant"
          ? "mr-auto bg-white border border-zinc-100"
          : "ml-auto bg-[#BCFAF9] text-zinc-900 max-w-[85%]",
      )}
    >
      {content ? (
        <Markdown>{content}</Markdown>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <LoadingIndicator />
        </div>
      )}
    </div>
  );
}

export function EssayGuruPane({
  essayTitle,
  essayPrompt,
  onClose,
  essayContent,
}: EssayGuruPaneProps) {
  const { user } = useAuthUser();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const newChatIdQuery = useQuery(
    orpc.chat.newId.queryOptions({
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }),
  );
  const chatId = newChatIdQuery.data;

  const systemContext = [
    `The student is currently working on an essay titled: "${essayTitle}".`,
    essayPrompt ? `The essay prompt is: "${essayPrompt}"` : "",
    "",
    "IMPORTANT RULES:",
    "- You are an essay brainstorming assistant. Help the student think critically about their essay topic.",
    "- Ask probing questions to help them develop their own ideas.",
    "- Suggest angles, themes, and approaches they could explore.",
    "- NEVER write paragraphs, draft text, or produce essay content for them.",
    "- NEVER provide sample sentences or full passages they could copy.",
    "- Instead, guide them with questions, frameworks, and thinking prompts.",
    "- Keep responses concise - use bullet points and short paragraphs.",
    "- If they ask you to write something for them, politely decline and redirect to brainstorming.",
  ]
    .filter(Boolean)
    .join("\n");

  const chat = useChat({
    id: chatId ? `essay-guru-${chatId}` : "essay-guru-pending",
    transport: {
      sendMessages: async (options) => {
        // Prepend essay context as a system message so the AI knows the topic
        const messagesWithContext = [
          {
            id: "system-context",
            role: "system" as const,
            content: systemContext,
            parts: [{ type: "text" as const, text: systemContext }],
            createdAt: new Date(),
          },
          ...options.messages,
        ];
        return eventIteratorToStream(
          await orpc.chat.student.call(
            {
              studentUserId: user.id,
              messages: messagesWithContext,
              chatId: chatId!,
            },
            { signal: options.abortSignal },
          ),
        );
      },
      reconnectToStream: () => {
        throw new Error("Unsupported");
      },
    },
  });

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const visibleMessages = chat.messages.filter((m) => m.role !== "system");
  const isEmpty = visibleMessages.length === 0;

  const handleSend = () => {
    if (!input.trim() || !chatId) return;
    chat.setMessages([
      ...chat.messages,
      {
        id: "essay-content",
        role: "system",
        parts: [
          { type: "text", text: "Current essay content: " + essayContent },
        ],
      },
    ]);

    chat.sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestedQuestion = (question: string) => {
    if (!chatId) return;
    chat.sendMessage({ text: question });
  };

  return (
    <div className="w-[380px] flex-shrink-0 border-l border-zinc-200 bg-zinc-50 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200 bg-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <BrainIcon
            className="size-5"
            weight="fill"
            style={{ color: "#BCFAF9", filter: "brightness(0.7)" }}
          />
          <span className="text-sm font-semibold text-zinc-900">Guru</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-zinc-600 rounded hover:bg-zinc-100 transition-colors"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 custom-scrollbar">
        {isEmpty && (
          <div className="text-center py-6">
            <div className="size-10 rounded-full bg-gradient-to-br from-[#BCFAF9]/30 to-[#BCFAF9]/50 flex items-center justify-center mx-auto mb-3">
              <BrainIcon
                className="size-5"
                weight="fill"
                style={{ color: "#BCFAF9", filter: "brightness(0.7)" }}
              />
            </div>
            <p className="text-sm font-medium text-zinc-900 mb-1">
              Essay Brainstorming
            </p>
            <p className="text-xs text-zinc-500 mb-4 px-2">
              I'll help you think through ideas and angles for your essay. I
              won't write it for you — that's your job!
            </p>

            <div className="space-y-1.5 text-left">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestedQuestion(q)}
                  disabled={!chatId}
                  className="w-full flex items-start gap-2 px-3 py-2 text-xs text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-colors text-left disabled:opacity-50"
                >
                  <CaretCircleRightIcon className="size-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {visibleMessages.map((message) => (
          <SidebarMessage key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-1 flex-shrink-0">
        <div className="flex items-end gap-2 bg-white border border-zinc-200 rounded-lg px-3 py-2">
          <AutosizeTextArea
            value={input}
            onValueChange={(v) => {
              setInput(v);
            }}
            placeholder="Ask about your essay..."
            className="flex-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chat.status === "streaming" || !chatId}
            className="p-1.5 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <ArrowUpIcon className="size-3.5" weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
