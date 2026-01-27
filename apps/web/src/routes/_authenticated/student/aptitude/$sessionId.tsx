import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { orpc, client } from "orpc/client";
import { Loader } from "@/components/loader";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { FavoriteSubjectsStep } from "@/features/aptitude/components/FavoriteSubjectsStep";
import { SubjectComfortStep } from "@/features/aptitude/components/SubjectComfortStep";
import { QuestionsStep } from "@/features/aptitude/components/QuestionsStep";
import { ResultsStep } from "@/features/aptitude/components/ResultsStep";
import { StepIndicator } from "@/features/aptitude/components/StepIndicator";

export const Route = createFileRoute(
  "/_authenticated/student/aptitude/$sessionId"
)({
  component: AptitudeSessionPage,
});

function AptitudeSessionPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state for viewing completed sessions (no API calls needed)
  const [viewingStep, setViewingStep] = useState<number | null>(null);

  const sessionQuery = useQuery(
    orpc.aptitude.getOne.queryOptions({ input: { sessionId } })
  );

  const updateMutation = useMutation({
    mutationFn: async (data: {
      currentStep?: number;
      status?: "not_started" | "in_progress" | "completed";
      favoriteSubjects?: string[];
      subjectComfortLevels?: Record<string, number>;
      questionsResponses?: { questions: string[]; answers: string[] };
    }) => {
      return client.aptitude.update({
        sessionId,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.aptitude.getOne.queryOptions({ input: { sessionId } })
          .queryKey,
      });
    },
  });

  const session = sessionQuery.data;
  const isLoading = sessionQuery.isLoading;
  const isCompleted = session?.status === "completed";

  // For completed sessions, use viewingStep; otherwise use session.currentStep
  const currentStep = isCompleted
    ? (viewingStep ?? session?.currentStep ?? 4)
    : (session?.currentStep || 1);

  // Reset viewingStep when session changes
  useEffect(() => {
    if (session?.status === "completed") {
      setViewingStep(4); // Start at results for completed sessions
    } else {
      setViewingStep(null);
    }
  }, [session?.id, session?.status]);

  const handleNext = async () => {
    if (isCompleted) {
      // For completed sessions, just update local state
      setViewingStep((prev) => Math.min((prev ?? currentStep) + 1, 4));
    } else {
      await updateMutation.mutateAsync({
        currentStep: currentStep + 1,
        status: "in_progress",
      });
    }
  };

  const handlePrevious = async () => {
    if (currentStep > 1) {
      if (isCompleted) {
        // For completed sessions, just update local state
        setViewingStep((prev) => Math.max((prev ?? currentStep) - 1, 1));
      } else {
        await updateMutation.mutateAsync({
          currentStep: currentStep - 1,
        });
      }
    }
  };

  const handleComplete = () => {
    navigate({ to: "/student/aptitude" });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="h-48" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-600">Session not found</p>
        <Link
          to="/student/aptitude"
          className="text-blue-600 hover:text-blue-700"
        >
          Back to Aptitude Tests
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 text-left min-h-0 overflow-hidden">
      {/* Back Navigation */}
      <div className="flex items-center flex-shrink-0">
        <Link
          to="/student/aptitude"
          className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Aptitude Tests
        </Link>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-xl border border-zinc-200 flex-shrink-0">
        <StepIndicator currentStep={currentStep} isCompleted={isCompleted} />
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 flex-1 min-h-0 overflow-auto">
        {currentStep === 1 && (
          <FavoriteSubjectsStep
            session={session}
            updateSession={updateMutation.mutateAsync}
            onNext={handleNext}
            readOnly={isCompleted}
          />
        )}
        {currentStep === 2 && (
          <SubjectComfortStep
            session={session}
            updateSession={updateMutation.mutateAsync}
            onNext={handleNext}
            onPrevious={handlePrevious}
            readOnly={isCompleted}
          />
        )}
        {currentStep === 3 && (
          <QuestionsStep
            session={session}
            updateSession={updateMutation.mutateAsync}
            onNext={handleNext}
            onPrevious={handlePrevious}
            readOnly={isCompleted}
          />
        )}
        {currentStep === 4 && (
          <ResultsStep
            session={session}
            updateSession={updateMutation.mutateAsync}
            onComplete={handleComplete}
            onPrevious={handlePrevious}
          />
        )}
      </div>
    </div>
  );
}
