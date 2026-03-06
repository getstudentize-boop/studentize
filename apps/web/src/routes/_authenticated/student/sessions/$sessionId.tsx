import { Button } from "@/components/button";
import { Dialog, DialogClose } from "@/components/dialog";
import { Loader } from "@/components/loader";
import { Markdown } from "@/components/markdown";
import { AutosizeTextArea } from "@/features/autosize-text-area";
import { SessionRatingStars } from "@/features/session-rating";
import { useSessionDownloadReplay } from "@/hooks/use-session";
import {
  ArrowLeftIcon,
  ArrowLineDownIcon,
  ListDashesIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { client, orpc } from "orpc/client";
import { useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/student/sessions/$sessionId",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const queryClient = useQueryClient();

  const [isDownloadedKickstarted, setIsDownloadKickstarted] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [ratingFeedback, setRatingFeedback] = useState("");

  const sessionId = params.sessionId;

  const { downloadSessionReplay } = useSessionDownloadReplay();

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

  const isReplayDownloadQuery = useQuery(
    orpc.session.isReplayDownloaded.queryOptions({ input: { sessionId } }),
  );

  const sessionOverview = sessionOverviewQuery.data;
  const ratingQueryKey = orpc.session.overview.queryOptions({
    input: { sessionId },
  }).queryKey;

  const rateSessionMutation = useMutation({
    mutationFn: async () => {
      return client.session.rate({
        sessionId,
        rating: selectedRating,
        ratingFeedback,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ratingQueryKey });
      setIsRatingDialogOpen(false);
    },
  });

  const openRatingDialog = () => {
    setSelectedRating(sessionOverview?.rating ?? 0);
    setRatingFeedback(sessionOverview?.ratingFeedback ?? "");
    setIsRatingDialogOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 text-left">
      {/* Back Navigation */}
      <div className="flex items-center">
        <Link
          to="/student/sessions"
          className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Sessions
        </Link>
      </div>

      <div className="flex gap-4 flex-1">
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
              <div className="flex items-center gap-3">
                {sessionOverview?.rating ? (
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <SessionRatingStars
                      rating={sessionOverview.rating}
                      size="sm"
                      disabled
                    />
                    <span>{sessionOverview.rating}/5</span>
                  </div>
                ) : null}

                <Button variant="neutral" onClick={openRatingDialog}>
                  {sessionOverview?.rating ? "Edit rating" : "Rate session"}
                </Button>
              </div>

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
            </div>
          </div>
          <div className="p-4 flex flex-col gap-4">
            {sessionOverview?.ratingFeedback ? (
              <div className="border border-bzinc rounded-lg bg-zinc-50 p-4">
                <div className="mb-2 text-sm font-medium text-zinc-900">
                  Your feedback
                </div>
                <div className="text-sm text-zinc-600">
                  {sessionOverview.ratingFeedback}
                </div>
              </div>
            ) : null}

            <div className="border border-bzinc bg-gradient-to-t to-zinc-100 from-white rounded-lg">
              <div className="flex gap-4 items-center mb-2 px-4 py-2 border-b border-bzinc">
                <ListDashesIcon />
                <div>Summary</div>
              </div>
              <div className="p-4 pt-2">{sessionOverview?.summary}</div>
            </div>
          </div>
        </div>
        <div className="w-96 h-[calc(100vh-4.2rem)] rounded-lg border border-bzinc bg-white overflow-y-auto custom-scrollbar">
          <div className="flex border-b border-bzinc px-4 pt-2 sticky top-0 bg-white">
            <div className="border-b-2 border-zinc-800 p-2">Transcription</div>
          </div>
          <div className="p-4">
            <Markdown>
              {sessionQuery.data?.content || "No transcription available."}
            </Markdown>
          </div>
        </div>
      </div>

      <Dialog
        trigger={<div />}
        className="p-0 max-w-xl"
        isOpen={isRatingDialogOpen}
        onOpenChange={setIsRatingDialogOpen}
      >
        <div className="p-6 border-b border-bzinc flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold text-zinc-900">
              How was your experience?
            </div>
            <div className="mt-2 text-sm text-zinc-600">
              Please rate your session and share any additional feedback.
            </div>
          </div>
          <DialogClose>
            <Button variant="neutral">
              <XIcon className="size-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div>
            <div className="mb-3 text-sm font-medium text-zinc-900">Rating</div>
            <SessionRatingStars
              rating={selectedRating}
              onChange={setSelectedRating}
              size="lg"
            />
          </div>

          <div>
            <div className="mb-3 text-sm font-medium text-zinc-900">
              Additional feedback (optional)
            </div>
            <div className="rounded-lg border border-bzinc px-4 py-3">
              <AutosizeTextArea
                value={ratingFeedback}
                onValueChange={setRatingFeedback}
                placeholder="Tell us more about your experience..."
                className="min-h-24 max-h-40"
              />
            </div>
          </div>

          {rateSessionMutation.isError ? (
            <div className="text-sm text-rose-600">
              {rateSessionMutation.error?.message ||
                "We couldn't save your rating. Please try again."}
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 bg-zinc-50 border-t border-bzinc flex justify-end gap-3">
          <DialogClose>
            <Button variant="neutral">Cancel</Button>
          </DialogClose>
          <Button
            variant="secondary"
            onClick={() => rateSessionMutation.mutate()}
            isLoading={rateSessionMutation.isPending}
            disabled={selectedRating === 0}
          >
            Submit rating
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
