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
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useEffect, useRef, useState } from "react";
import { virtualAdvisors } from "../virtual-advisors";

export const Route = createFileRoute(
  "/_authenticated/student/virtual-advisors/$advisor"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

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

  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleCall = async () => {
    if (isConnected) {
      disconnect();
      return;
    }

    setIsLoading(true);
    try {
      const data = await createTokenMutation.mutateAsync({});
      await initializeConnection(data.value);
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
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isConnected]);

  const minutes = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");

  const advisor = virtualAdvisors.find(
    (advisor) => advisor.slug === params.advisor
  )!;

  return (
    <div className="flex-1 flex p-4 gap-4">
      <VirtualAdvisorCard
        src={advisor?.src}
        name={advisor?.name}
        university={advisor?.university}
        logo={advisor?.logo}
        isSelected
      />
      <div className="flex-2 flex flex-col gap-4">
        <div className="flex-1 rounded-xl border border-bzinc bg-white p-4">
          <div className="flex justify-between">
            <Link to="/student/virtual-advisors">
              <ArrowLeftIcon className="size-4" weight="bold" />
            </Link>
            {isConnected && (
              <div className="px-2 py-1 rounded-md bg-white border border-bzinc flex gap-2 items-center">
                <RecordIcon weight="fill" className="text-red-600" />
                <div>
                  {minutes}:{seconds}
                </div>
              </div>
            )}
            <div />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center mt-2">
              {error.message}
            </p>
          )}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 mt-4">
            {transcript.map((entry, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                  entry.role === "user"
                    ? "self-end bg-primary text-white"
                    : "self-start bg-zinc-100 text-zinc-800"
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
    </div>
  );
}
