import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { useSessionSummary } from "@/hooks/use-session-summary";
import { SparkleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { orpc } from "orpc/client";
import { useState } from "react";
import Markdown from "react-markdown";

export const SessionSummaryTool = ({
  output = {},
  input = {},
}: {
  output: any;
  input: any;
}) => {
  const [isGenerationCalled, setIsGenerationCalled] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const { startSessionSummaryGeneration } = useSessionSummary();

  const sessionQuery = useQuery(
    orpc.session.getOne.queryOptions({
      input: { sessionId: input.sessionId },
      enabled: !output,
    })
  );

  const startSessionGeneration = async () => {
    setIsLoading(true);

    await startSessionSummaryGeneration({ sessionId: input.sessionId });
    setIsGenerationCalled(true);

    setIsLoading(false);
  };

  const summary = output || sessionQuery.data?.summary;

  return (
    <Dialog
      trigger={
        <button className="rounded-md shadow-sm outline outline-bzinc py-1 px-2 inline-flex gap-2 items-center cursor-pointer">
          <SparkleIcon />
          <div>Session Summary</div>
        </button>
      }
      className="p-0"
    >
      <div className="px-4 py-3 border-bzinc border-b flex gap-4 items-center">
        <SparkleIcon />
        Key insights from a specific session
        {!summary ? (
          <Link
            to="/sessions/$sessionId"
            params={{ sessionId: input.sessionId }}
            className="font-semibold hover:underline"
            target="_blank"
          >
            ({input.sessionId})
          </Link>
        ) : null}
      </div>
      <div className="p-4">
        {summary ? (
          <div className="rounded-lg border border-zinc-200 bg-gradient-to-b from-zinc-100 to-white">
            <div className="px-4 py-2 font-semibold border-b border-zinc-200 flex justify-between items-center">
              <div>Summary</div>
              <div>
                ID:{" "}
                <Link
                  to="/sessions/$sessionId"
                  params={{ sessionId: input.sessionId }}
                  className="hover:underline"
                >
                  {input.sessionId}
                </Link>
              </div>
            </div>
            <div className="p-4">
              <Markdown>{summary}</Markdown>
            </div>
          </div>
        ) : null}

        {!summary && !isGenerationCalled ? (
          <Button
            variant="primaryLight"
            className="rounded-md mx-auto my-4"
            onClick={() => startSessionGeneration()}
            isLoading={isLoading}
          >
            Generate a session summary
          </Button>
        ) : null}

        {!summary && isGenerationCalled ? (
          <div className="text-center text-sm text-zinc-500 italic my-4">
            A generation request has been sent. Please{" "}
            <button
              onClick={() => sessionQuery.refetch()}
              className="underline font-semibold hover:no-underline"
            >
              refresh
              {sessionQuery.isFetching ? "ing..." : ""}
            </button>{" "}
            or send another message to see the summary once it is ready (Note:
            generation may take up to a minute).
          </div>
        ) : null}
      </div>
    </Dialog>
  );
};
