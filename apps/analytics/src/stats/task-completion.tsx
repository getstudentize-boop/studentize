import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../orpc/client";

function Skeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 h-3 w-24 animate-pulse rounded bg-zinc-100" />
      <div className="mb-4 h-7 w-20 animate-pulse rounded bg-zinc-100" />
      <div className="mt-auto flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="mb-1 h-3 w-32 animate-pulse rounded bg-zinc-100" />
            <div className="h-2 animate-pulse rounded-full bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskCompletion() {
  const { data, isLoading } = useQuery(
    orpc.taskCompletion.queryOptions({ input: undefined }),
  );

  if (isLoading || !data) return <Skeleton />;

  const { categories, totalTasks, completionRate } = data;

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 text-xs font-medium text-zinc-500">
        Task Completion
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-900">
          {completionRate}%
        </span>
        <span className="text-xs text-zinc-400">{totalTasks} total tasks</span>
      </div>
      <div className="mb-4 flex gap-3 text-xs text-zinc-400">
        <span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />{" "}
          Done
        </span>
        <span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-300" />{" "}
          In Progress
        </span>
        <span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-200" />{" "}
          Pending
        </span>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {categories.map((c) => {
          const catTotal = c.pending + c.inProgress + c.completed;
          return (
            <div key={c.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600">
                  {c.label}
                </span>
                <span className="text-xs tabular-nums text-zinc-400">
                  {c.completed}/{catTotal}
                </span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full">
                <div
                  className="bg-blue-600"
                  style={{ width: `${(c.completed / catTotal) * 100}%` }}
                />
                <div
                  className="bg-blue-300"
                  style={{ width: `${(c.inProgress / catTotal) * 100}%` }}
                />
                <div
                  className="bg-zinc-200"
                  style={{ width: `${(c.pending / catTotal) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
