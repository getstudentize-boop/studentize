import { Button } from "@/components/button";
import { SessionRatingStars } from "@/features/session-rating";
import { Loader } from "@/components/loader";
import { Markdown } from "@/components/markdown";
import { useSessionDownloadReplay } from "@/hooks/use-session";
import {
  ArrowLineDownIcon,
  ArrowClockwiseIcon,
  BrainIcon,
  ListDashesIcon,
  ShieldCheckIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc, client } from "orpc/client";
import { useState } from "react";
import z from "zod";
import { useAuthUser } from "@/routes/_authenticated";

export const Route = createFileRoute(
  "/_authenticated/sessions/user/$sessionId",
)({
  component: RouteComponent,
  validateSearch: z
    .object({
      tab: z.enum(["participants", "transcriptions"]).default("transcriptions"),
    })
    .optional(),
});

function RouteComponent() {
  const params = Route.useParams();
  const { tab = "transcriptions" } = Route.useSearch();

  const [isDownloadedKickstarted, setIsDownloadKickstarted] = useState(false);

  const sessionId = params.sessionId;
  const queryClient = useQueryClient();
  const { user } = useAuthUser();
  const isAdmin = ["OWNER", "ADMIN"].includes(user.organization?.role ?? "");

  const { downloadSessionReplay } = useSessionDownloadReplay();

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      return await client.session.summarizeTranscription({ sessionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.session.overview.queryOptions({ input: { sessionId } })
          .queryKey,
      });
    },
  });

  const generateSystemSummaryMutation = useMutation(
    orpc.session.generateSystemSummary.mutationOptions({
      onSuccess: () => {
        return queryClient.invalidateQueries({
          queryKey: orpc.session.overview.queryOptions({ input: { sessionId } })
            .queryKey,
        });
      },
    }),
  );

  const regenerateTranscriptionMutation = useMutation({
    mutationFn: async () => {
      return await client.session.regenerateTranscription({ sessionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.session.readTranscription.queryOptions({
          input: { sessionId },
        }).queryKey,
      });
    },
  });

  const replyUrlQuery = useQuery(
    orpc.session.replayUrl.queryOptions({
      input: { sessionId },
    }),
  );

  const sessionOverviewQuery = useQuery(
    orpc.session.overview.queryOptions({
      input: { sessionId },
    }),
  );

  const sessionQuery = useQuery(
    orpc.session.readTranscription.queryOptions({ input: { sessionId } }),
  );

  const participantsQuery = useQuery(
    orpc.session.participants.queryOptions({ input: { sessionId } }),
  );

  const isReplayDownloadQuery = useQuery(
    orpc.session.isReplayDownloaded.queryOptions({ input: { sessionId } }),
  );

  const sessionOverview = sessionOverviewQuery.data;

  return (
    <div className="flex-1 flex p-4 gap-4 text-left">
      <div className="border border-bzinc bg-white flex-1 rounded-lg flex flex-col h-[100vh-100px] overflow-y-auto no-scrollbar">
        <div className="p-4">
          {replyUrlQuery.isPending ? (
            <Loader className="h-96 rounded-lg" />
          ) : replyUrlQuery.isError || !replyUrlQuery.data ? (
            <div className="h-96 rounded-lg border border-bzinc bg-zinc-50 flex items-center justify-center">
              <div className="text-center text-zinc-600">
                <p className="text-lg font-medium mb-2">
                  Video replay not available
                </p>
                <p className="text-sm">
                  {isReplayDownloadQuery.data?.isDownloaded
                    ? "The replay file may still be processing."
                    : "The replay has not been downloaded yet."}
                </p>
              </div>
            </div>
          ) : (
            <video className="w-full h-96 rounded-lg object-cover" controls>
              <source src={replyUrlQuery.data} type="video/mp4" />
            </video>
          )}
        </div>
        <div className="px-4 py-3 border-y border-bzinc flex justify-between items-center">
          <div>{sessionOverview?.title}</div>

          <div className="flex gap-4 items-center">
            {isReplayDownloadQuery.isSuccess &&
            !isReplayDownloadQuery.data.isDownloaded ? (
              <>
                {isDownloadedKickstarted ? (
                  <div className="text-zinc-600">
                    Download started in background (wait 5 minutes)
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      await downloadSessionReplay({ sessionId });
                      setIsDownloadKickstarted(true);
                    }}
                  >
                    <ArrowLineDownIcon className="size-4" />
                  </button>
                )}
              </>
            ) : null}

            <Link
              to="/guru"
              search={{ userId: sessionOverview?.studentUserId ?? "" }}
            >
              <Button className="rounded-md">
                Chat with Guru
                <BrainIcon />
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {sessionOverview?.rating ? (
            <div className="border border-bzinc rounded-lg bg-zinc-50 p-4">
              <div className="mb-3 text-sm font-medium text-zinc-900">
                Student rating
              </div>
              <div className="flex items-center gap-3">
                <SessionRatingStars
                  rating={sessionOverview.rating}
                  size="md"
                  disabled
                />
                <div className="text-sm text-zinc-600">
                  {sessionOverview.rating}/5
                </div>
              </div>
              {sessionOverview.ratingFeedback ? (
                <div className="mt-3 text-sm text-zinc-600">
                  {sessionOverview.ratingFeedback}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="border border-bzinc bg-gradient-to-t to-zinc-100 from-white rounded-lg">
            <div className="flex gap-4 items-center mb-2 px-4 py-2 border-b border-bzinc">
              <ListDashesIcon />
              <div>Summary</div>
            </div>
            <div className="p-4 pt-2">
              {sessionOverviewQuery.isPending ? (
                <div className="text-zinc-500">Loading...</div>
              ) : sessionOverview?.summary ? (
                sessionOverview.summary
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-zinc-500 mb-4">
                    No summary has been generated for this session yet.
                  </p>
                  <Button
                    onClick={() => generateSummaryMutation.mutate()}
                    disabled={generateSummaryMutation.isPending}
                    className="rounded-md"
                  >
                    {generateSummaryMutation.isPending ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <SparkleIcon className="size-4" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                  {generateSummaryMutation.isError && (
                    <p className="text-red-500 text-sm mt-2">
                      Failed to generate summary. Please try again.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {isAdmin ? (
            <div className="border border-cyan-800 bg-gradient-to-t to-cyan-900 from-cyan-800 text-white rounded-lg">
              <div className="flex gap-4 items-center mb-2 px-4 py-2 border-b border-cyan-800">
                <ShieldCheckIcon className="text-white" />
                <div>System Summary</div>
                <span className="text-xs bg-white text-cyan-600 px-2 py-0.5 rounded ml-auto">
                  Admin Only
                </span>
              </div>
              <div className="p-4 pt-2">
                {sessionOverviewQuery.isPending ? (
                  <div>Loading...</div>
                ) : sessionOverview?.systemSummary ? (
                  <Markdown>{sessionOverview.systemSummary}</Markdown>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-white mb-4">
                      No system summary has been generated for this session yet.
                    </p>
                    <Button
                      onClick={() =>
                        generateSystemSummaryMutation.mutate({
                          sessionId: sessionId ?? "",
                        })
                      }
                      disabled={generateSystemSummaryMutation.isPending}
                      className="rounded-md"
                    >
                      {generateSystemSummaryMutation.isPending ? (
                        <>Generating...</>
                      ) : (
                        <>
                          <ShieldCheckIcon className="size-4" />
                          Generate System Summary
                        </>
                      )}
                    </Button>
                    {generateSystemSummaryMutation.isError && (
                      <p className="text-red-500 text-sm mt-2">
                        Failed to generate system summary. Please try again.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="w-96 rounded-lg border border-bzinc bg-white overflow-y-auto custom-scrollbar">
        <div className="flex border-b border-bzinc px-4 pt-2 sticky top-0 bg-white">
          <Link
            to="."
            search={{ tab: "participants" }}
            className={
              tab === "participants"
                ? "border-b-2 border-zinc-800"
                : "border-b-2 border-white opacity-70"
            }
          >
            <div className="p-2 cursor-pointer">Participants</div>
          </Link>
          <Link
            to="."
            search={{ tab: "transcriptions" }}
            className={
              tab === "transcriptions"
                ? "border-b-2 border-zinc-800"
                : "border-b-2 border-white opacity-70"
            }
          >
            <div className="p-2 cursor-pointer">Transcription</div>
          </Link>
        </div>
        <div className="p-4 overflow-y-auto custom-scrollbar">
          {tab === "participants" ? (
            participantsQuery.isLoading ? (
              <div className="text-zinc-600">Loading participants...</div>
            ) : participantsQuery.isError ? (
              <div className="text-zinc-600">Failed to load participants</div>
            ) : !participantsQuery.data ||
              participantsQuery.data.length === 0 ? (
              <div className="text-zinc-600">
                No participants found for this session.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {participantsQuery.data.map((participant) => (
                  <div
                    key={participant.id}
                    className="border border-bzinc rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">{participant.name}</div>
                      {participant.is_host && (
                        <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-1 rounded">
                          Host
                        </span>
                      )}
                    </div>
                    {participant.email && (
                      <div className="text-sm text-zinc-600">
                        {participant.email}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : sessionQuery.isPending ? (
            <div className="text-zinc-500">Loading transcription...</div>
          ) : sessionQuery.data?.content ? (
            <Markdown>{sessionQuery.data.content}</Markdown>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-zinc-500 mb-4">
                No transcription available for this session.
              </p>
              <Button
                onClick={() => regenerateTranscriptionMutation.mutate()}
                disabled={regenerateTranscriptionMutation.isPending}
                className="rounded-md"
              >
                {regenerateTranscriptionMutation.isPending ? (
                  <>Generating...</>
                ) : (
                  <>
                    <ArrowClockwiseIcon className="size-4" />
                    Generate Transcription
                  </>
                )}
              </Button>
              {regenerateTranscriptionMutation.isError && (
                <p className="text-red-500 text-sm mt-2">
                  {regenerateTranscriptionMutation.error?.message ||
                    "Failed to generate transcription. Please try again."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
