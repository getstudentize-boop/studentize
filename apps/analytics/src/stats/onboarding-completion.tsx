import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../orpc/client";

function Skeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 h-3 w-32 animate-pulse rounded bg-zinc-100" />
      <div className="mb-4 h-7 w-16 animate-pulse rounded bg-zinc-100" />
      <div className="flex flex-1 flex-col justify-end gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-2 animate-pulse rounded-full bg-zinc-100" />
        ))}
      </div>
    </div>
  );
}

export function OnboardingCompletion() {
  const { data, isLoading } = useQuery(
    orpc.onboardingCompletion.queryOptions({ input: undefined }),
  );

  if (isLoading || !data) return <Skeleton />;

  const { steps, total, completionRate } = data;

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 text-xs font-medium text-zinc-500">
        Onboarding Completion
      </div>
      <div className="mb-4 text-2xl font-semibold text-zinc-900">
        {completionRate}%
      </div>
      <div className="flex flex-1 flex-col justify-end gap-1.5">
        {steps.map((step) => {
          const pct = total > 0 ? Math.round((step.value / total) * 100) : 0;
          return (
            <div key={step.label} className="flex items-center gap-2">
              <span className="w-24 shrink-0 truncate text-xs text-zinc-500">
                {step.label}
              </span>
              <div className="h-2 flex-1 rounded-full bg-zinc-100">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs tabular-nums text-zinc-400">
                {step.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
