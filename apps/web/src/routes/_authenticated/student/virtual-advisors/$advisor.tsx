import { VirtualAdvisorCard } from "@/features/virtual-advisor-card";
import { ShortlistConfirmationDialog } from "@/features/shortlist-confirmation-dialog";
import { useWebRTC } from "@/hooks/use-webrtc";
import { cn } from "@/utils/cn";
import {
  ArrowLeftIcon,
  GraduationCapIcon,
  InfoIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PhoneDisconnectIcon,
  PhoneOutgoingIcon,
  PlusIcon,
  RecordIcon,
  XIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { virtualAdvisors } from "../virtual-advisors";
import z from "zod";
import { format } from "date-fns";

export const Route = createFileRoute(
  "/_authenticated/student/virtual-advisors/$advisor",
)({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        sessionId: z.string().optional(),
      })
      .parse(search),
});

function RouteComponent() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const queryClient = useQueryClient();

  const {
    isConnected,
    isMuted,
    error,
    transcript,
    setTranscript,
    markShortlistSaved,
    disconnect,
    toggleMute,
    initializeConnection,
  } = useWebRTC();

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const createTokenMutation = useMutation(
    orpc.virtualAdvisor.createToken.mutationOptions(),
  );

  const saveSessionMutation = useMutation(
    orpc.virtualAdvisor.saveSession.mutationOptions(),
  );

  const endSessionMutation = useMutation(
    orpc.virtualAdvisor.endSession.mutationOptions(),
  );

  const bulkSaveShortlistMutation = useMutation(
    orpc.shortlist.bulkSave.mutationOptions(),
  );

  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(
    search.sessionId || null,
  );
  const [showHistory, setShowHistory] = useState(false);
  const [shortlistDialogIndex, setShortlistDialogIndex] = useState<
    number | null
  >(null);
  const [shortlistError, setShortlistError] = useState<string | null>(null);
  const [historyShortlist, setHistoryShortlist] = useState<{
    universities: Array<{
      name: string;
      country: string;
      category: "reach" | "target" | "safety";
      notes?: string;
    }>;
    saved: boolean;
  } | null>(null);
  const lastSavedTranscriptLength = useRef(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advisor = virtualAdvisors.find(
    (advisor) => advisor.slug === params.advisor,
  )!;

  // Load existing session if sessionId is provided
  const { data: existingSession } = useQuery(
    orpc.virtualAdvisor.getSession.queryOptions({
      input: { sessionId: search.sessionId! },
      enabled: !!search.sessionId,
    }),
  );

  // Load all sessions for history
  const { data: allSessions } = useQuery(
    orpc.virtualAdvisor.listSessions.queryOptions({}),
  );

  // Save conversation periodically
  const saveConversation = useCallback(async () => {
    if (
      transcript.length === 0 ||
      transcript.length === lastSavedTranscriptLength.current
    ) {
      return;
    }

    try {
      const newMessages = transcript
        .slice(lastSavedTranscriptLength.current)
        .map((entry) => {
          if (entry.role === "shortlist") {
            return {
              role: "tool" as const,
              metadata: {
                toolName: "save_shortlist",
                input: { universities: entry.universities },
                output: { saved: entry.saved },
              },
            };
          }
          return { role: entry.role, text: entry.text };
        });
      if (newMessages.length === 0) return;
      const result = await saveSessionMutation.mutateAsync({
        sessionId: sessionId || undefined,
        advisorSlug: advisor.slug,
        messages: newMessages,
      });

      if (result.sessionId && result.sessionId !== sessionId) {
        setSessionId(result.sessionId);
        // Update URL with sessionId
        navigate({
          to: Route.fullPath,
          params: { advisor: params.advisor },
          search: { sessionId: result.sessionId },
          replace: true,
        });
      }

      lastSavedTranscriptLength.current = transcript.length;
    } catch (err) {
      console.error("Failed to save conversation:", err);
    }
  }, [transcript, sessionId, advisor.slug, saveSessionMutation, navigate]);

  const handleCall = async () => {
    if (isConnected) {
      // End session and save conversation
      if (sessionId) {
        try {
          await endSessionMutation.mutateAsync({ sessionId });
        } catch (err) {
          console.error("Failed to end session:", err);
        }
      }
      // Save any remaining messages
      await saveConversation();
      disconnect();
      return;
    }

    setIsLoading(true);
    try {
      const data = await createTokenMutation.mutateAsync({});
      // Seed transcript with existing messages so they stay visible
      if (existingSession?.messages && transcript.length === 0) {
        const seeded: typeof transcript = existingSession.messages
          .map((m) => {
            if (m.role === "tool" && m.metadata) {
              const meta = m.metadata as {
                toolName: string;
                input: { universities: Array<{ name: string; country: string; category: "reach" | "target" | "safety"; notes?: string }> };
                output?: { saved?: boolean };
              };
              if (meta.toolName === "save_shortlist") {
                return {
                  role: "shortlist" as const,
                  universities: meta.input.universities,
                  saved: meta.output?.saved ?? true,
                };
              }
              return null;
            }
            if (!m.text) return null;
            return { role: m.role as "user" | "assistant", text: m.text };
          })
          .filter((m): m is NonNullable<typeof m> => m !== null);
        setTranscript(seeded);
        lastSavedTranscriptLength.current = seeded.length;
      } else {
        lastSavedTranscriptLength.current = 0;
      }
      // Pass existing messages so the model has prior context
      const priorMessages = existingSession?.messages?.filter(
        (m) => m.role !== "tool" && m.text,
      );
      await initializeConnection(data.value, advisor.slug, priorMessages);
    } catch (err) {
      console.error("Failed to start call:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-open the dialog when a new shortlist entry appears
  useEffect(() => {
    const lastEntry = transcript[transcript.length - 1];
    if (lastEntry?.role === "shortlist" && !lastEntry.saved) {
      setShortlistDialogIndex(transcript.length - 1);
    }
  }, [transcript]);

  const activeShortlist =
    shortlistDialogIndex !== null ? transcript[shortlistDialogIndex] : null;
  const activeShortlistUniversities =
    activeShortlist?.role === "shortlist" ? activeShortlist.universities : null;

  const handleConfirmShortlist = async () => {
    if (!activeShortlistUniversities || shortlistDialogIndex === null) return;
    setShortlistError(null);
    try {
      await bulkSaveShortlistMutation.mutateAsync({
        universities: activeShortlistUniversities,
        virtualAdvisorSessionId: sessionId || undefined,
      });
      queryClient.invalidateQueries({
        queryKey: orpc.shortlist.getMyShortlist.queryOptions({ input: {} })
          .queryKey,
      });
      markShortlistSaved(shortlistDialogIndex);
      setShortlistDialogIndex(null);
    } catch (err) {
      console.error("Failed to save shortlist:", err);
      setShortlistError("Failed to save your shortlist. Please try again.");
    }
  };

  const handleCloseShortlistDialog = () => {
    setShortlistDialogIndex(null);
    setShortlistError(null);
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Timer effect - only depends on isConnected
  useEffect(() => {
    if (isConnected) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isConnected]);

  // Save conversation periodically while connected
  useEffect(() => {
    if (isConnected) {
      saveIntervalRef.current = setInterval(() => {
        saveConversation();
      }, 10000);
    } else {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    }

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [isConnected, saveConversation]);

  // Load existing session transcript if sessionId is provided
  useEffect(() => {
    if (existingSession?.messages && transcript.length === 0) {
      // Note: We can't directly set transcript from useWebRTC hook
      // This would require modifying the hook or using a different approach
      // For now, we'll just show the existing messages in the UI
    }
  }, [existingSession, transcript.length]);

  const minutes = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");

  return (
    <div className="flex-1 flex p-4 gap-4 h-full overflow-hidden">
      <VirtualAdvisorCard
        src={advisor?.src}
        name={advisor?.name}
        subtitle={advisor?.subtitle}
        slug={advisor?.slug}
        logo={advisor?.logo}
        isSelected
      />
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex-1 flex flex-col rounded-xl border border-bzinc bg-white p-4 min-h-0">
          <div className="flex justify-between items-center flex-shrink-0 gap-2">
            <Link to="/student/virtual-advisors">
              <ArrowLeftIcon className="size-4" weight="bold" />
            </Link>
            <div className="flex-1 flex justify-center">
              {existingSession?.title || (sessionId && !existingSession) ? (
                <div className="text-sm font-medium text-zinc-700 truncate max-w-md text-center">
                  {existingSession?.title || "Loading..."}
                </div>
              ) : isConnected ? (
                <div className="px-2 py-1 rounded-md bg-white border border-bzinc flex gap-2 items-center">
                  <RecordIcon weight="fill" className="text-red-600" />
                  <div>
                    {minutes}:{seconds}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (isConnected) {
                    handleCall(); // end current call first
                  }
                  setSessionId(null);
                  lastSavedTranscriptLength.current = 0;
                  navigate({
                    to: Route.fullPath,
                    params: { advisor: params.advisor },
                    search: {},
                    replace: true,
                  });
                }}
              >
                <PlusIcon weight="bold" className="size-4" />
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="px-2 py-0.5 bg-zinc-50 border border-bzinc rounded-md text-md hover:bg-zinc-100 transition-colors"
              >
                History
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center mt-2 flex-shrink-0">
              {error.message}
            </p>
          )}
          <div className="flex-1 overflow-y-auto no-scrollbar text-left flex flex-col gap-3 mt-4 min-h-0">
            {/* Show existing session messages if loading from history */}
            <AnimatePresence initial={false}>
              {existingSession?.messages && transcript.length === 0
                ? existingSession.messages.map(
                    (
                      entry: {
                        role: string;
                        text: string | null;
                        metadata?: unknown;
                      },
                      i: number,
                    ) => {
                      if (entry.role === "tool" && entry.metadata) {
                        const meta = entry.metadata as {
                          toolName: string;
                          input: {
                            universities: Array<{
                              name: string;
                              country: string;
                              category: "reach" | "target" | "safety";
                              notes?: string;
                            }>;
                          };
                          output?: { saved?: boolean };
                        };
                        if (meta.toolName === "save_shortlist") {
                          const universities = meta.input.universities;
                          const saved = meta.output?.saved ?? true;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{
                                duration: 0.25,
                                ease: "easeOut",
                              }}
                              className="self-start"
                            >
                              <button
                                onClick={() =>
                                  setHistoryShortlist({ universities, saved })
                                }
                                className={cn(
                                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                                  saved
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
                                )}
                              >
                                <GraduationCapIcon
                                  className="size-4"
                                  weight="fill"
                                />
                                {saved
                                  ? `Shortlist saved (${universities.length})`
                                  : `Review shortlist (${universities.length})`}
                              </button>
                            </motion.div>
                          );
                        }
                        return null;
                      }
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className={cn(
                            "max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-line",
                            entry.role === "user"
                              ? "self-end bg-zinc-100 text-zinc-800"
                              : "self-start ",
                          )}
                        >
                          {entry.text}
                        </motion.div>
                      );
                    },
                  )
                : transcript.map((entry, i) =>
                    entry.role === "shortlist" ? (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="self-start"
                      >
                        <button
                          onClick={() => setShortlistDialogIndex(i)}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                            entry.saved
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
                          )}
                        >
                          <GraduationCapIcon className="size-4" weight="fill" />
                          {entry.saved
                            ? `Shortlist saved (${entry.universities.length})`
                            : `Review shortlist (${entry.universities.length})`}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className={cn(
                          "max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-line",
                          entry.role === "user"
                            ? "self-end bg-zinc-100 text-zinc-800"
                            : "self-start ",
                        )}
                      >
                        {entry.text}
                      </motion.div>
                    ),
                  )}
            </AnimatePresence>
            <div ref={transcriptEndRef} />
          </div>
        </div>

        <div className="p-2 gap-4 border border-bzinc flex justify-center rounded-xl items-center bg-white">
          <InfoIcon className="size-6" />
          <button
            onClick={handleCall}
            disabled={isLoading}
            className={cn(
              "p-3 rounded-full text-white cursor-pointer disabled:opacity-50",
              isConnected
                ? "bg-radial to-red-800 from-red-600"
                : "bg-radial to-green-800 from-green-700",
            )}
          >
            {isConnected ? (
              <PhoneDisconnectIcon className="size-5" weight="fill" />
            ) : (
              <PhoneOutgoingIcon className="size-5" weight="fill" />
            )}
          </button>
          <button
            onClick={toggleMute}
            disabled={!isConnected}
            className="cursor-pointer disabled:opacity-50"
          >
            {isMuted ? (
              <MicrophoneSlashIcon className="size-5 text-red-500" />
            ) : (
              <MicrophoneIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200">
              <div className="text-md font-semibold text-zinc-900">
                Session History
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1.5 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors"
              >
                <XIcon size={18} className="text-zinc-600" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6">
              {allSessions && allSessions.length > 0 ? (
                <div className="space-y-3">
                  {allSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        navigate({
                          to: Route.fullPath,
                          params: { advisor: params.advisor },
                          search: { sessionId: session.id },
                          replace: true,
                        });
                        setShowHistory(false);
                      }}
                      className={cn(
                        "w-full text-left p-4 rounded-lg border transition-colors",
                        session.id === search.sessionId
                          ? "border-blue-500 bg-blue-50"
                          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-zinc-900 truncate">
                            {session.title || "Untitled Session"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
                            <span>
                              {format(
                                new Date(session.createdAt as string | Date),
                                "MMM d, yyyy 'at' h:mm a",
                              )}
                            </span>
                            {session.endedAt && (
                              <>
                                <span>•</span>
                                <span>
                                  Ended{" "}
                                  {format(
                                    new Date(session.endedAt as string | Date),
                                    "MMM d, yyyy",
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {session.id === search.sessionId && (
                          <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  <p className="text-sm">No sessions yet</p>
                  <p className="text-xs mt-1">
                    Start a conversation to create your first session
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shortlist Confirmation Dialog — live transcript entries */}
      {activeShortlistUniversities && (
        <ShortlistConfirmationDialog
          universities={activeShortlistUniversities}
          isOpen={!!activeShortlistUniversities}
          isSaved={
            activeShortlist?.role === "shortlist" && activeShortlist.saved
          }
          onConfirm={handleConfirmShortlist}
          onCancel={handleCloseShortlistDialog}
          isSaving={bulkSaveShortlistMutation.isPending}
          error={shortlistError}
        />
      )}

      {/* Shortlist Confirmation Dialog — loaded from history */}
      {historyShortlist && (
        <ShortlistConfirmationDialog
          universities={historyShortlist.universities}
          isOpen={!!historyShortlist}
          isSaved={historyShortlist.saved}
          onConfirm={async () => {
            setShortlistError(null);
            try {
              await bulkSaveShortlistMutation.mutateAsync({
                universities: historyShortlist.universities,
                virtualAdvisorSessionId: sessionId || undefined,
              });
              queryClient.invalidateQueries({
                queryKey: orpc.shortlist.getMyShortlist.queryOptions({ input: {} })
                  .queryKey,
              });
              setHistoryShortlist({
                ...historyShortlist,
                saved: true,
              });
            } catch {
              setShortlistError(
                "Failed to save your shortlist. Please try again.",
              );
            }
          }}
          onCancel={() => {
            setHistoryShortlist(null);
            setShortlistError(null);
          }}
          isSaving={bulkSaveShortlistMutation.isPending}
          error={shortlistError}
        />
      )}
    </div>
  );
}
