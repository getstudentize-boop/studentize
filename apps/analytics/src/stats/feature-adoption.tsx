import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../orpc/client";

const colors = [
  "bg-blue-600",
  "bg-blue-500",
  "bg-blue-400",
  "bg-blue-300",
  "bg-blue-200",
  "bg-blue-100",
];

function Skeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 h-3 w-28 animate-pulse rounded bg-zinc-100" />
      <div className="mb-1 h-7 w-24 animate-pulse rounded bg-zinc-100" />
      <div className="mb-4 h-3 w-36 animate-pulse rounded bg-zinc-100" />
      <div className="flex flex-1 flex-col justify-end gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-3 animate-pulse rounded bg-zinc-100" />
        ))}
      </div>
    </div>
  );
}

export function FeatureAdoption() {
  const { data, isLoading } = useQuery(
    orpc.featureAdoption.queryOptions({ input: undefined }),
  );

  if (isLoading || !data) return <Skeleton />;

  const { totalStudents, features } = data;

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 text-xs font-medium text-zinc-500">
        Feature Adoption
      </div>
      <div className="mb-1 text-2xl font-semibold text-zinc-900">
        {totalStudents}{" "}
        <span className="text-sm font-normal text-zinc-400">students</span>
      </div>
      <div className="mb-4 text-xs text-zinc-400">
        At least one feature used
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2.5">
        {features.map((f, i) => {
          const pct =
            totalStudents > 0 ? Math.round((f.users / totalStudents) * 100) : 0;
          return (
            <div key={f.label} className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700">
                {f.label}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-zinc-100">
                  <div
                    className={`h-1.5 rounded-full ${colors[i] ?? "bg-blue-600"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs tabular-nums text-zinc-400">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
