import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { ArrowLeftIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { Button } from "@/components/button";
import { EssayEditor } from "@/components/essay-editor";
import { useState, useEffect, useMemo } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { countWordsInTiptap } from "@/utils/essay";

export const Route = createFileRoute("/_authenticated/essays/$essayId")({
  component: EssayEditorPage,
});

function EssayEditorPage() {
  const { essayId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const essayQuery = useQuery(
    orpc.essay.get.queryOptions({ input: { essayId } })
  );

  const [content, setContent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const updateEssayMutation = useMutation(
    orpc.essay.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.essay.get.key({ input: { essayId } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.essay.list.key(),
        });
        setIsSaving(false);
        setLastSaved(new Date());
      },
    })
  );

  const debouncedUpdate = useDebounceCallback((newContent: any) => {
    setIsSaving(true);
    updateEssayMutation.mutate({
      essayId,
      content: newContent,
    });
  }, 5000);

  useEffect(() => {
    if (essayQuery.data && content === null) {
      setContent(essayQuery.data.content || { type: "doc", content: [] });
    }
  }, [essayQuery.data, content]);

  // Calculate word count from current content (must be before any early returns)
  const wordCount = useMemo(() => {
    if (!content) return 0;
    return countWordsInTiptap(content);
  }, [content]);

  const handleContentUpdate = (newContent: any) => {
    setContent(newContent);
    debouncedUpdate(newContent);
  };

  if (essayQuery.isLoading) {
    return (
      <div className="flex flex-1 h-screen items-center justify-center">
        <div className="text-zinc-600">Loading essay...</div>
      </div>
    );
  }

  if (!essayQuery.data) {
    return (
      <div className="flex flex-1 h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-600 mb-4">Essay not found</p>
          <Button variant="neutral" onClick={() => navigate({ to: "/essays" })}>
            Back to Essays
          </Button>
        </div>
      </div>
    );
  }

  const essay = essayQuery.data;

  return (
    <div className="flex flex-1 h-screen flex-col">
      <div className="border-b border-zinc-200 bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="neutral"
            onClick={() => navigate({ to: "/essays" })}
            className="flex-shrink-0"
          >
            <ArrowLeftIcon className="size-4" weight="bold" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">
              {essay.title}
            </h1>
            {essay.prompt && (
              <p className="text-sm text-zinc-600 line-clamp-1">
                {essay.prompt}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-400">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </div>
          <div 
            className="flex items-center gap-1.5 transition-opacity duration-300"
            style={{ opacity: isSaving ? 0.3 : 0 }}
          >
            <div className="w-px h-3 bg-zinc-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-zinc-50">
        <div className="max-w-4xl mx-auto py-8 px-6">
          {content && (
            <EssayEditor
              content={content}
              onUpdate={handleContentUpdate}
              className="bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
