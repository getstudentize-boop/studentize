import { Loader } from "@/components/loader";
import { Markdown } from "@/components/markdown";
import { Repeat } from "@/components/repeat";
import { cn } from "@/utils/cn";
import { SparkleIcon, SubtitlesIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";

const Card = ({
  title,
  children,
  variant = "violet",
}: {
  title: string;
  children: string;
  variant?: "violet" | "zinc";
}) => {
  const Icon = variant === "violet" ? SparkleIcon : SubtitlesIcon;

  return (
    <div
      className={cn(
        "p-2 border rounded-lg flex flex-col gap-2",
        variant === "violet"
          ? "border-[#BCFAF9]/40 bg-[#BCFAF9]/20"
          : "border-zinc-200 bg-zinc-50/40"
      )}
    >
      <div>
        <div
          className={cn(
            "rounded-md border bg-white inline-flex items-center py-0.5 px-1 gap-2",
            variant === "violet" ? "border-[#BCFAF9]/40" : "border-zinc-200"
          )}
        >
          <Icon
            weight="fill"
            className={cn(
              variant === "violet" ? "text-zinc-900" : "text-zinc-800"
            )}
            style={variant === "violet" ? { color: '#BCFAF9', filter: 'brightness(0.7)' } : undefined}
          />
          <div
            className={cn(
              variant === "violet" ? "text-zinc-900" : "text-zinc-950"
            )}
          >
            {title}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "px-0.5 mt-1.5",
          variant === "violet" ? "text-zinc-900" : "text-zinc-950"
        )}
      >
        <Markdown>{children}</Markdown>
      </div>
    </div>
  );
};

export const MySessionsTab = ({ sessionId }: { sessionId?: string }) => {
  // If sessionId is provided, show that specific session's details
  const sessionOverviewQuery = useQuery({
    ...orpc.session.overview.queryOptions({
      input: { sessionId: sessionId! },
    }),
    enabled: !!sessionId,
  });

  const sessionTranscriptQuery = useQuery({
    ...orpc.session.readTranscription.queryOptions({
      input: { sessionId: sessionId! },
    }),
    enabled: !!sessionId,
  });

  // Otherwise show all session summaries
  const summaryQuery = useQuery({
    ...orpc.student.getMySessionSummaries.queryOptions({ input: {} }),
    enabled: !sessionId,
  });

  // Show specific session details when sessionId is provided
  if (sessionId) {
    const isPending = sessionOverviewQuery.isPending || sessionTranscriptQuery.isPending;
    const isError = sessionOverviewQuery.isError || sessionTranscriptQuery.isError;
    const overview = sessionOverviewQuery.data;
    const transcript = sessionTranscriptQuery.data;

    return (
      <div className="rounded-md p-6 flex flex-col gap-4">
        {isPending ? (
          <Repeat
            component={
              <div className="rounded-lg border border-bzinc p-2">
                <Loader className="h-6 w-32 mb-2" />
                <Loader />
                <Loader className="mt-1 w-3/4" />
                <Loader className="mt-1 w-1/4" />
              </div>
            }
            times={2}
          />
        ) : isError ? (
          <div className="text-center text-zinc-500 p-4">
            Failed to load session details
          </div>
        ) : (
          <>
            {overview?.summary && (
              <Card title="Session Summary" variant="violet">
                {overview.summary}
              </Card>
            )}
            {transcript?.content && (
              <Card title="Transcription" variant="zinc">
                {transcript.content}
              </Card>
            )}
            {!overview?.summary && !transcript?.content && (
              <div className="text-center text-zinc-500 p-4">
                No details available for this session
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Show all session summaries when no sessionId
  const session = summaryQuery.data;
  const isPendingOrError = summaryQuery.isPending || summaryQuery.isError;

  return (
    <div className="rounded-md p-6 flex flex-col gap-4">
      {isPendingOrError ? (
        <Repeat
          component={
            <div className="rounded-lg border border-bzinc p-2">
              <Loader className="h-6 w-32 mb-2" />

              <Loader />
              <Loader className="mt-1 w-3/4" />
              <Loader className="mt-1 w-1/4" />
            </div>
          }
          times={4}
        />
      ) : null}

      {!isPendingOrError ? (
        <>
          {session?.overview ? (
            <Card title="User Summary">{session?.overview}</Card>
          ) : null}

          {session?.summaries.map((s) => (
            <Card key={s.id} title={s.title} variant="zinc">
              {s.summary ?? ""}
            </Card>
          ))}
        </>
      ) : null}
    </div>
  );
};
