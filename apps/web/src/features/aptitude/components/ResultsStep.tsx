import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  GraduationCapIcon,
} from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "orpc/client";
import type { AptitudeTestSession } from "@student/db/src/schema/aptitude";

type ResultsStepProps = {
  session: AptitudeTestSession;
  updateSession: (data: unknown) => Promise<unknown>;
  onComplete: () => void;
  onPrevious: () => void;
};

function getMatchColor(percentage: number): string {
  if (percentage >= 85) return "text-green-600 bg-green-50";
  if (percentage >= 70) return "text-lime-600 bg-lime-50";
  if (percentage >= 50) return "text-amber-600 bg-amber-50";
  if (percentage >= 30) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
}

function getProgressColor(percentage: number): string {
  if (percentage >= 85) return "bg-green-500";
  if (percentage >= 70) return "bg-lime-500";
  if (percentage >= 50) return "bg-amber-500";
  if (percentage >= 30) return "bg-orange-500";
  return "bg-red-500";
}

export function ResultsStep({
  session: initialSession,
  onComplete,
  onPrevious,
}: ResultsStepProps) {
  const queryClient = useQueryClient();
  const [expandedInterest, setExpandedInterest] = useState<string | null>(null);
  const [hasTriggeredGeneration, setHasTriggeredGeneration] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      return client.aptitude.generateRecommendations({
        sessionId: initialSession.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.aptitude.getOne.queryOptions({
          input: { sessionId: initialSession.id },
        }).queryKey,
      });
    },
  });

  // Use the mutation result if available, otherwise use initial session
  const session = generateMutation.data ?? initialSession;
  const isCompleted = session.status === "completed";
  const isGenerating = generateMutation.isPending;

  // Auto-trigger generation if not completed (only once)
  useEffect(() => {
    if (initialSession.status !== "completed" && !hasTriggeredGeneration) {
      setHasTriggeredGeneration(true);
      generateMutation.mutate();
    }
  }, [initialSession.status, hasTriggeredGeneration]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <img src="/logo.png" alt="Loading" className="w-12 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">
          Analyzing Your Responses
        </h2>
        <p className="text-zinc-600">
          Our AI is generating personalized career recommendations...
        </p>
        <div className="mt-6 space-y-2 text-sm text-zinc-500">
          <p>Evaluating your interests and strengths</p>
          <p>Matching with career pathways</p>
          <p>Crafting personalized guidance</p>
        </div>
      </div>
    );
  }

  if (generateMutation.isError) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-red-500 mb-4">
          <p className="text-lg font-medium">Failed to generate recommendations</p>
          <p className="text-sm">{generateMutation.error?.message}</p>
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <CheckCircleIcon className="size-12 text-green-500 mx-auto mb-4" weight="fill" />
        <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
          Your Career Profile
        </h2>
        <p className="text-zinc-600">
          Based on your responses, here are your top career interest matches
        </p>
      </div>

      {/* Interest Matches */}
      <div className="space-y-4 mb-8">
        {[...(session.interestMatches || [])]
          .sort((a, b) => b.matchPercentage - a.matchPercentage)
          .map((match, index) => (
          <div
            key={match.interest}
            className="bg-white rounded-xl border border-zinc-200 overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedInterest(
                  expandedInterest === match.interest ? null : match.interest
                )
              }
              className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-zinc-400">
                  #{index + 1}
                </span>
                <div className="text-left">
                  <h3 className="font-semibold text-zinc-900">{match.interest}</h3>
                  <p className="text-sm text-zinc-500">
                    {match.careers?.length || 0} career paths
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        getProgressColor(match.matchPercentage)
                      )}
                      style={{ width: `${match.matchPercentage}%` }}
                    />
                  </div>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    getMatchColor(match.matchPercentage)
                  )}
                >
                  {match.matchPercentage}%
                </span>
              </div>
            </button>

            {expandedInterest === match.interest && (
              <div className="border-t border-zinc-100 p-4 bg-zinc-50">
                {match.reasoning && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-zinc-700 mb-1">
                      Why this matches you:
                    </h4>
                    <p className="text-sm text-zinc-600">{match.reasoning}</p>
                  </div>
                )}

                {match.careers && match.careers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-zinc-700 mb-2">
                      Career Paths:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {match.careers.map((career, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-lg border border-zinc-200 p-3"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{career.emoji}</span>
                            <div>
                              <p className="font-medium text-zinc-900 text-sm">
                                {career.title}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                                <GraduationCapIcon className="size-3" />
                                {career.major}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Personalized Recommendations */}
      {session.recommendations && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BriefcaseIcon className="size-5 text-blue-600" />
            <h3 className="font-semibold text-zinc-900">
              Personalized Recommendations
            </h3>
          </div>
          <div className="prose prose-sm prose-zinc max-w-none">
            {session.recommendations.split("\n").map((paragraph, idx) => (
              <p key={idx} className="text-zinc-700">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Review Answers
        </button>

        <button
          onClick={onComplete}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Back to Aptitude Tests
        </button>
      </div>
    </div>
  );
}
