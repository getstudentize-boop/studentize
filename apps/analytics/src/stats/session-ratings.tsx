import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../orpc/client";

function Skeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 h-3 w-24 animate-pulse rounded bg-zinc-100" />
      <div className="mb-4 h-7 w-16 animate-pulse rounded bg-zinc-100" />
      <div className="mt-auto flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-2 animate-pulse rounded-full bg-zinc-100" />
        ))}
      </div>
    </div>
  );
}

export function SessionRatings() {
  const { data, isLoading } = useQuery(
    orpc.sessionRatings.queryOptions({ input: undefined }),
  );

  if (isLoading || !data) return <Skeleton />;

  const { ratings, total, avg } = data;
  const max = Math.max(...ratings.map((r) => r.count), 1);

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 text-xs font-medium text-zinc-500">
        Session Ratings
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-900">{avg}</span>
        <span className="text-sm text-zinc-400">/ 5</span>
      </div>
      <div className="mb-4 text-xs text-zinc-400">{total} rated sessions</div>

      <div className="mt-auto flex flex-col gap-2">
        {ratings.map((r) => (
          <div key={r.stars} className="flex items-center gap-2">
            <span className="w-4 text-right text-xs font-medium text-zinc-500">
              {r.stars}
            </span>
            <span className="text-xs text-amber-400">★</span>
            <div className="h-2 flex-1 rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${(r.count / max) * 100}%` }}
              />
            </div>
            <span className="w-6 text-right text-xs tabular-nums text-zinc-400">
              {r.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
