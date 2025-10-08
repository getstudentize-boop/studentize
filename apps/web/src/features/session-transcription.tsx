import { Markdown } from "@/components/markdown";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";

export const SessionTranscription = ({ sessionId }: { sessionId: string }) => {
  const sessionQuery = useQuery(
    orpc.session.readTranscription.queryOptions({ input: { sessionId } })
  );

  if (sessionQuery.isLoading) {
    return <div className="mt-4">Reading...</div>;
  }

  return (
    <div className="text-left p-4">
      <Markdown>
        {sessionQuery.data?.content || "No transcription available."}
      </Markdown>
    </div>
  );
};
