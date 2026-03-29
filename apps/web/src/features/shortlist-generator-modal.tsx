import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { XIcon, SparkleIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { ShortlistConfirmationDialog } from "@/features/shortlist-confirmation-dialog";
import type { ShortlistUniversity } from "@/hooks/use-webrtc";

interface ShortlistGeneratorModalProps {
  onClose: () => void;
}

export function ShortlistGeneratorModal({
  onClose,
}: ShortlistGeneratorModalProps) {
  const queryClient = useQueryClient();

  const [universities, setUniversities] = useState<
    ShortlistUniversity[] | null
  >(null);
  const [saved, setSaved] = useState(false);
  const [shortlistError, setShortlistError] = useState<string | null>(null);

  const generateMutation = useMutation(
    orpc.shortlist.generate.mutationOptions({
      onSuccess: (data) => {
        setUniversities(
          data.universities.map((u) => ({
            name: u.name,
            country: u.country,
            category: u.category as "reach" | "target" | "safety",
            notes: u.notes,
          })),
        );
      },
    }),
  );

  const bulkSaveMutation = useMutation(
    orpc.shortlist.bulkSave.mutationOptions(),
  );

  const handleGenerate = () => {
    setUniversities(null);
    setSaved(false);
    setShortlistError(null);
    generateMutation.mutate({});
  };

  const handleConfirm = async () => {
    if (!universities) return;
    setShortlistError(null);
    try {
      await bulkSaveMutation.mutateAsync({ universities });
      setSaved(true);
      queryClient.invalidateQueries({
        queryKey: orpc.shortlist.getMyShortlist.queryOptions({ input: {} })
          .queryKey,
      });
    } catch {
      setShortlistError("Failed to save your shortlist. Please try again.");
    }
  };

  // Show the confirmation dialog once the agent returns universities
  if (universities) {
    return (
      <ShortlistConfirmationDialog
        universities={universities}
        isOpen
        isSaved={saved}
        onConfirm={handleConfirm}
        onCancel={saved ? onClose : () => setUniversities(null)}
        isSaving={bulkSaveMutation.isPending}
        error={shortlistError}
      />
    );
  }

  // Generate modal
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
              <SparkleIcon
                size={20}
                className="text-purple-600"
                weight="fill"
              />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">AI Shortlist</h2>
              <p className="text-xs text-zinc-500">
                Personalized university recommendations
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={generateMutation.isPending}
              className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-8 text-center">
          {generateMutation.isPending ? (
            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full">
                <CircleNotchIcon
                  size={32}
                  className="text-purple-600 animate-spin"
                />
              </div>
              <div>
                <p className="font-medium text-zinc-900">
                  Generating your shortlist...
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  Analyzing your profile and searching universities
                </p>
              </div>
            </div>
          ) : generateMutation.isError ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-red-600">
                Something went wrong generating your shortlist. Please try
                again.
              </p>
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-sm"
              >
                <SparkleIcon size={18} weight="fill" />
                Retry
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-10">
              <div>
                <div className="font-semibold text-zinc-900 mb-1">
                  Generate Your Shortlist
                </div>
                <p className="text-zinc-500 max-w-xs mx-auto">
                  We'll analyze your profile, scores, and interests to build a
                  balanced mix of reach, target, and safety schools.
                </p>
              </div>
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-sm"
              >
                <SparkleIcon size={18} weight="fill" />
                Generate Recommendations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
