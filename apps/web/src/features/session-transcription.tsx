import { Button } from "@/components/button";
import { Markdown } from "@/components/markdown";
import { convertStringToFile, uploadFileToStorage } from "@/utils/s3";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useEffect, useState, useTransition } from "react";

export const SessionTranscription = ({
  sessionId,
  isEditing,
  onClose,
}: {
  sessionId: string;
  isEditing: boolean;
  onClose?: () => void;
}) => {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const utils = useQueryClient();

  const sessionQuery = useQuery(
    orpc.session.readTranscription.queryOptions({ input: { sessionId } })
  );

  const uploadTranscriptionMutation = useMutation(
    orpc.session.transcriptionUploadUrl.mutationOptions()
  );

  const isEqual = content === sessionQuery.data?.content;

  const handleSave = async () => {
    startTransition(async () => {
      const c = content.trim();
      if (!c) return;

      const result = await uploadTranscriptionMutation.mutateAsync({
        sessionId: sessionId,
        ext: "txt",
      });

      const markdown = await convertStringToFile(
        content,
        `${sessionId}.txt`,
        "text/plain"
      );

      await uploadFileToStorage(result.url, markdown);

      await utils.invalidateQueries({
        queryKey: orpc.session.readTranscription.queryKey({
          input: { sessionId },
        }),
      });

      onClose?.();
    });
  };

  useEffect(() => {
    if (isEditing) {
      setContent(sessionQuery.data?.content || "");
    }
  }, [isEditing]);

  if (sessionQuery.isLoading) {
    return <div className="mt-4">Reading...</div>;
  }

  return (
    <>
      <div className="text-left p-4 pb-20 h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-full w-full resize-none outline-none"
          />
        ) : (
          <Markdown>
            {sessionQuery.data?.content || "No transcription available."}
          </Markdown>
        )}
      </div>
      {isEditing ? (
        <div className="absolute bottom-0 left-0 flex items-center h-14 w-full bg-white border-t border-bzinc p-4">
          {!isEqual ? (
            <Button
              className="w-full rounded-md flex"
              isLoading={isPending}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
