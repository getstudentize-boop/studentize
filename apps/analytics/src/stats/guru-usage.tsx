import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../orpc/client";

function Skeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 h-3 w-24 animate-pulse rounded bg-zinc-100" />
      <div className="mb-1 h-7 w-20 animate-pulse rounded bg-zinc-100" />
      <div className="mb-4 h-3 w-40 animate-pulse rounded bg-zinc-100" />
      <div className="mt-auto flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-2 animate-pulse rounded-full bg-zinc-100" />
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

  const { totalSessions, avgMessagesPerSession, topAdvisors } = data;
  const max = topAdvisors[0]?.sessions ?? 1;

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 text-xs font-medium text-zinc-500">
        Guru AI Usage
      </div>
      <div className="mb-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-900">
          {totalSessions}
        </span>
        <span className="text-sm font-normal text-zinc-400">sessions</span>
      </div>
      <div className="mb-4 text-xs text-zinc-400">
        ~{avgMessagesPerSession} messages per session
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
          By advisor
        </div>
        {topAdvisors.map((a) => (
          <div key={a.label} className="flex items-center gap-2">
            <span className="w-28 shrink-0 truncate text-xs text-zinc-600">
              {a.label}
            </span>
            <div className="h-2 flex-1 rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${(a.sessions / max) * 100}%` }}
              />
            </div>
            <span className="w-7 text-right text-xs tabular-nums text-zinc-400">
              {a.sessions}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
