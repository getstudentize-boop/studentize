import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../orpc/client";

function Skeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 h-3 w-36 animate-pulse rounded bg-zinc-100" />
      <div className="mb-2 h-7 w-20 animate-pulse rounded bg-zinc-100" />
      <div className="mt-auto flex items-end gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-md bg-zinc-100"
            style={{ height: `${30 + Math.random() * 50}px` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ActiveStudents() {
  const { data, isLoading } = useQuery(
    orpc.activeStudents.queryOptions({ input: undefined }),
  );

  if (isLoading || !data) return <Skeleton />;

  const { weeks, current, changePct } = data;
  const max = Math.max(...weeks.map((w) => w.value), 1);

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 text-xs font-medium text-zinc-500">
        Weekly Active Students
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-900">{current}</span>
        <span
          className={`text-xs font-medium ${changePct >= 0 ? "text-emerald-600" : "text-red-500"}`}
        >
          {changePct >= 0 ? "+" : ""}
          {changePct}%
        </span>
      </div>
      <div className="mb-2 text-xs text-zinc-400">vs previous week</div>

      <div className="mt-auto flex items-end gap-2">
        {weeks.map((w, i) => {
          const height = Math.max((w.value / max) * 100, 8);
          const isLast = i === weeks.length - 1;
          return (
            <div
              key={w.label}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span className="text-[10px] tabular-nums text-zinc-400">
                {w.value}
              </span>
              <div
                className={`w-full rounded-md ${isLast ? "bg-blue-600" : "bg-blue-200"}`}
                style={{ height: `${height}px` }}
              />
              <span className="text-[10px] text-zinc-400">{w.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
