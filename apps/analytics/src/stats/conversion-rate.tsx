import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../orpc/client";

function Skeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 h-3 w-32 animate-pulse rounded bg-zinc-100" />
      <div className="mb-2 h-7 w-16 animate-pulse rounded bg-zinc-100" />
      <div className="mt-auto flex items-end gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-md bg-zinc-100"
            style={{ height: `${20 + Math.random() * 60}px` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ConversionRate() {
  const { data, isLoading } = useQuery(
    orpc.conversionRate.queryOptions({ input: undefined }),
  );

  if (isLoading || !data) return <Skeleton />;

  const { months, totalFree, totalPaid, conversionRate } = data;
  const max = Math.max(...months.map((m) => m.free + m.paid), 1);

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-1 text-xs font-medium text-zinc-500">
        Free → Paid Conversion
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-900">
          {conversionRate}%
        </span>
        <span className="text-xs text-zinc-400">overall</span>
      </div>
      <div className="mb-2 flex gap-3 text-xs text-zinc-400">
        <span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-200" />{" "}
          Free {totalFree}
        </span>
        <span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />{" "}
          Paid {totalPaid}
        </span>
      </div>

      <div className="mt-auto flex items-end gap-2">
        {months.map((m) => {
          const freeH = Math.max((m.free / max) * 80, 4);
          const paidH = Math.max((m.paid / max) * 80, 4);
          return (
            <div
              key={m.label}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div className="flex w-full flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-t-md bg-blue-600"
                  style={{ height: `${paidH}px` }}
                />
                <div
                  className="w-full rounded-b-md bg-blue-200"
                  style={{ height: `${freeH}px` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400">{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
