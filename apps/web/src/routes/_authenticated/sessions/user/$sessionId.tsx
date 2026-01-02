import { Button } from "@/components/button";
import { Loader } from "@/components/loader";
import { Markdown } from "@/components/markdown";
import { useSessionDownloadReplay } from "@/hooks/use-session";
import {
  ArrowLineDownIcon,
  BrainIcon,
  ListDashesIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc } from "orpc/client";
import { useState } from "react";
import z from "zod";

export const Route = createFileRoute(
  "/_authenticated/sessions/user/$sessionId"
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

  const [isDownloadedKickstarted, setIsDownloadKickstarted] = useState(false);

  const sessionId = params.sessionId;

  const { downloadSessionReplay } = useSessionDownloadReplay();

  const replyUrlQuery = useQuery(
    orpc.session.replayUrl.queryOptions({
      input: { sessionId },
    })
  );

  const sessionOverviewQuery = useQuery(
    orpc.session.overview.queryOptions({
      input: { sessionId },
    })
  );

  const sessionQuery = useQuery(
    orpc.session.readTranscription.queryOptions({ input: { sessionId } })
  );

  const isReplayDownloadQuery = useQuery(
    orpc.session.isReplayDownloaded.queryOptions({ input: { sessionId } })
  );

  const sessionOverview = sessionOverviewQuery.data;

  return (
    <div className="flex-1 flex p-4 pl-0 gap-4 text-left">
      <div className="border border-bzinc bg-white flex-1 rounded-lg flex flex-col h-[100vh-100px] overflow-y-auto no-scrollbar">
        <div className="p-4">
          {replyUrlQuery.isPending ? (
            <Loader className="h-96 rounded-lg" />
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
                {isDownloadedKickstarted ||
                !isReplayDownloadQuery.data.isBotAttached ? (
                  <div className="text-zinc-600">
                    {isDownloadedKickstarted
                      ? "Download started in background (wait 5 minutes)"
                      : "No history of bot attached to the session"}
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      setIsDownloadKickstarted(true);
                      await downloadSessionReplay({ sessionId });
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
          <div className="border border-bzinc bg-gradient-to-t to-zinc-100 from-white rounded-lg">
            <div className="flex gap-4 items-center mb-2 px-4 py-2 border-b border-bzinc">
              <ListDashesIcon />
              <div>Summary</div>
            </div>
            <div className="p-4 pt-2">{sessionOverview?.summary}</div>
          </div>
        </div>
      </div>
      <div className="w-96 rounded-lg border border-bzinc bg-white overflow-y-auto custom-scrollbar">
        <div className="flex border-b border-bzinc px-4 pt-2 sticky top-0 bg-white">
          <div className="border-b-2 border-white p-2 opacity-70">
            Participants
          </div>
          <div className="border-b-2 border-zinc-800 p-2">Transcription</div>
        </div>
        <div className="p-4">
          <Markdown>
            {sessionQuery.data?.content || "No transcription available."}
          </Markdown>
        </div>
      </div>
    </div>
  );
}
