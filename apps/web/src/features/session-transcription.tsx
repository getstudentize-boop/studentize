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
    <div className="text-left p-4 h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
      <Markdown>
        {sessionQuery.data?.content || "No transcription available."}
      </Markdown>
    </div>
  );
};
