import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../orpc/client";

const categoryColors = ["bg-blue-600", "bg-blue-400", "bg-blue-200"];

function Skeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 h-3 w-28 animate-pulse rounded bg-zinc-100" />
      <div className="mb-4 h-7 w-24 animate-pulse rounded bg-zinc-100" />
      <div className="mb-4 h-3 animate-pulse rounded-full bg-zinc-100" />
      <div className="mb-5 flex justify-between">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-3 w-16 animate-pulse rounded bg-zinc-100" />
        ))}
      </div>
      <div className="mt-auto h-16 animate-pulse rounded-lg bg-zinc-50" />
    </div>
  );
}

export function ShortlistBreakdown() {
  const { data, isLoading } = useQuery(
    orpc.shortlistBreakdown.queryOptions({ input: undefined }),
  );

  if (isLoading || !data) return <Skeleton />;

  const { categories, sources, total } = data;
  const aiPct =
    sources.ai + sources.manual > 0
      ? Math.round((sources.ai / (sources.ai + sources.manual)) * 100)
      : 0;

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 text-xs font-medium text-zinc-500">
        Shortlist Breakdown
      </div>
      <div className="mb-4 text-2xl font-semibold text-zinc-900">
        {total}{" "}
        <span className="text-sm font-normal text-zinc-400">universities</span>
      </div>

      <div className="mb-4 flex h-3 overflow-hidden rounded-full">
        {categories.map((c, i) => (
          <div
            key={c.label}
            className={categoryColors[i]}
            style={{ width: `${total > 0 ? (c.value / total) * 100 : 0}%` }}
          />
        ))}
      </div>

      <div className="mb-5 flex justify-between">
        {categories.map((c, i) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${categoryColors[i]}`}
            />
            <span className="text-xs text-zinc-500">
              {c.label}{" "}
              <span className="font-medium text-zinc-700">{c.value}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto rounded-lg bg-zinc-50 px-3 py-2.5">
        <div className="mb-1.5 text-xs text-zinc-500">AI vs Manual adds</div>
        <div className="flex h-2 overflow-hidden rounded-full bg-zinc-200">
          <div className="bg-blue-600" style={{ width: `${aiPct}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-zinc-400">
          <span>AI — {sources.ai}</span>
          <span>Manual — {sources.manual}</span>
        </div>
      </div>
    </div>
  );
}
