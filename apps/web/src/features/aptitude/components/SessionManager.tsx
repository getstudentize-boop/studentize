import { cn } from "@/utils/cn";
import {
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Loader } from "@/components/loader";
import type { AptitudeTestSession } from "@student/db/src/schema/aptitude";

type SessionManagerProps = {
  sessions: AptitudeTestSession[];
  isLoading: boolean;
  limitInfo?: {
    totalTests: number;
    canCreateNew: boolean;
    maxAllowed: number;
  };
  onSelectSession: (sessionId: string) => void;
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircleIcon className="size-5 text-green-500" weight="fill" />;
    case "in_progress":
      return <PlayCircleIcon className="size-5 text-blue-500" weight="fill" />;
    default:
      return <ClockIcon className="size-5 text-zinc-400" />;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    default:
      return "Not Started";
  }
}

export function SessionManager({
  sessions,
  isLoading,
  limitInfo,
  onSelectSession,
}: SessionManagerProps) {
  if (isLoading) {
    return <Loader className="h-48" />;
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-zinc-200">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">
          No Aptitude Tests Yet
        </h3>
        <p className="text-zinc-600 max-w-md mx-auto">
          Take an aptitude test to discover your career interests and get
          personalized recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Limit info */}
      {limitInfo && !limitInfo.canCreateNew && (
        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <WarningCircleIcon className="size-5 text-amber-600" />
          <p className="text-sm text-amber-700">
            You've reached the maximum of {limitInfo.maxAllowed} aptitude tests.
          </p>
        </div>
      )}

      <h3 className="font-medium text-zinc-700">Your Test Sessions</h3>

      <div className="space-y-3">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={cn(
              "w-full bg-white rounded-lg border border-zinc-200 p-4 text-left transition-all hover:border-zinc-300 hover:shadow-sm"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(session.status)}
                <div>
                  <p className="font-medium text-zinc-900">
                    Aptitude Test #{sessions.indexOf(session) + 1}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Started {formatDate(session.createdAt)}
                    {session.completedAt &&
                      ` • Completed ${formatDate(session.completedAt)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {session.status === "completed" &&
                  session.interestMatches?.[0] && (
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-zinc-900">
                        Top Match
                      </p>
                      <p className="text-sm text-zinc-500">
                        {session.interestMatches[0].interest}
                      </p>
                    </div>
                  )}
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    session.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : session.status === "in_progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-zinc-100 text-zinc-600"
                  )}
                >
                  {getStatusLabel(session.status)}
                </span>
              </div>
            </div>

            {/* Progress bar for in-progress sessions */}
            {session.status !== "completed" && (
              <div className="mt-3 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between text-sm text-zinc-500 mb-1">
                  <span>Step {session.currentStep} of 4</span>
                  <span>{Math.round((session.currentStep / 4) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(session.currentStep / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
