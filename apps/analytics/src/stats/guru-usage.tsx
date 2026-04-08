import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../orpc/client";

function Skeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-3 h-3 w-24 animate-pulse rounded bg-zinc-100" />
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-100" />
            <div className="h-2 flex-1 animate-pulse rounded-full bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GuruUsage() {
  const { data, isLoading } = useQuery(
    orpc.guruUsage.queryOptions({ input: undefined }),
  );

  if (isLoading || !data) return <Skeleton />;

  const max = data[0]?.sessions ?? 1;

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-3 text-xs font-medium text-zinc-500">
        Top Guru Users
      </div>

      <div className="flex flex-col gap-2.5">
        {data.map((user) => (
          <div key={user.email} className="flex items-center gap-2">
            <div className="w-28 shrink-0 truncate">
              <span className="text-xs font-medium text-zinc-700">
                {user.name ?? user.email}
              </span>
            </div>
            <div className="h-2 flex-1 rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${(user.sessions / max) * 100}%` }}
              />
            </div>
            <span className="w-7 text-right text-xs tabular-nums text-zinc-400">
              {user.sessions}
            </span>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-xs text-zinc-400">No sessions yet</p>
        )}
      </div>
    </div>
  );
}
