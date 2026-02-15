import { VirtualAdvisorCard } from "@/features/virtual-advisor-card";
import { useWebRTC } from "@/hooks/use-webrtc";
import { cn } from "@/utils/cn";
import {
  ArrowLeftIcon,
  InfoIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PhoneDisconnectIcon,
  PhoneOutgoingIcon,
  RecordIcon,
  XIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useEffect, useRef, useState, useCallback } from "react";
import { virtualAdvisors } from "../virtual-advisors";
import z from "zod";
import { format } from "date-fns";

export const Route = createFileRoute(
  "/_authenticated/student/virtual-advisors/$advisor"
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

  const {
    isConnected,
    isMuted,
    error,
    transcript,
    disconnect,
    toggleMute,
    initializeConnection,
  } = useWebRTC();

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const createTokenMutation = useMutation(
    orpc.virtualAdvisor.createToken.mutationOptions()
  );

  const saveSessionMutation = useMutation(
    orpc.virtualAdvisor.saveSession.mutationOptions()
  );

  const endSessionMutation = useMutation(
    orpc.virtualAdvisor.endSession.mutationOptions()
  );

  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(
    search.sessionId || null
  );
  const [showHistory, setShowHistory] = useState(false);
  const lastSavedTranscriptLength = useRef(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advisor = virtualAdvisors.find(
    (advisor) => advisor.slug === params.advisor
  )!;

  // Load existing session if sessionId is provided
  const { data: existingSession } = useQuery({
    ...orpc.virtualAdvisor.getSession.queryOptions({
      input: { sessionId: search.sessionId! },
    }),
    enabled: !!search.sessionId,
  });

  // Load all sessions for history
  const { data: allSessions } = useQuery(
    orpc.virtualAdvisor.listSessions.queryOptions({})
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
      const newMessages = transcript.slice(lastSavedTranscriptLength.current);
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
      await initializeConnection(data.value, advisor.slug);
      // Reset saved transcript length for new session
      lastSavedTranscriptLength.current = 0;
    } catch (err) {
      console.error("Failed to start call:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => {
    if (isConnected) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
      // Save conversation every 10 seconds while connected
      saveIntervalRef.current = setInterval(() => {
        saveConversation();
      }, 10000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
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
        university={advisor?.university}
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
            <button
              onClick={() => setShowHistory(true)}
              className="px-2 py-0.5 bg-zinc-50 border border-bzinc rounded-md text-md hover:bg-zinc-100 transition-colors"
            >
              History
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center mt-2 flex-shrink-0">
              {error.message}
            </p>
          )}
          <div className="flex-1 overflow-y-auto no-scrollbar text-left flex flex-col gap-3 mt-4 min-h-0">
            {/* Show existing session messages if loading from history */}
            {existingSession?.messages && transcript.length === 0
              ? existingSession.messages.map(
                  (entry: { role: string; text: string }, i: number) => (
                    <div
                      key={i}
                      className={cn(
                        "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                        entry.role === "user"
                          ? "self-end bg-zinc-100 text-zinc-800"
                          : "self-start "
                      )}
                    >
                      {entry.text}
                    </div>
                  )
                )
              : transcript.map((entry, i) => (
                  <div
                    key={i}
                    className={cn(
                      "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                      entry.role === "user"
                        ? "self-end bg-zinc-100 text-zinc-800"
                        : "self-start "
                    )}
                  >
                    {entry.text}
                  </div>
                ))}
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
                : "bg-radial to-green-800 from-green-700"
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
                          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
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
                                "MMM d, yyyy 'at' h:mm a"
                              )}
                            </span>
                            {session.endedAt && (
                              <>
                                <span>•</span>
                                <span>
                                  Ended{" "}
                                  {format(
                                    new Date(session.endedAt as string | Date),
                                    "MMM d, yyyy"
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
    </div>
  );
}
