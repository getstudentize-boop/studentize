import { createFileRoute, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../orpc/client";

export const Route = createFileRoute("/guru")({
  component: Guru,
});

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="text-xs font-medium text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-zinc-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-zinc-400">{sub}</div>}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-2 h-3 w-24 animate-pulse rounded bg-zinc-100" />
      <div className="h-7 w-16 animate-pulse rounded bg-zinc-100" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 flex-1 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Guru() {
  const { data, isLoading } = useQuery(
    orpc.guruChats.queryOptions({ input: undefined }),
  );
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const activeChatId = (params as { chatSessionId?: string }).chatSessionId;

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-6 p-10 overflow-y-auto no-scrollbar">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Guru Chats</h1>
          <p className="text-sm text-zinc-500">
            Recent conversations students are having with Guru
          </p>
        </div>

        {isLoading || !data ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <TableSkeleton />
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Total Sessions" value={data.totalSessions} />
              <StatCard
                label="This Week"
                value={data.sessionsThisWeek}
                sub="conversations started"
              />
              <StatCard
                label="Avg Student Messages"
                value={data.avgStudentMessages}
                sub="per conversation"
              />
            </div>

            <div
              className="rounded-xl border border-zinc-200 bg-white overflow-hidden"
              style={{ height: "calc(100vh - 17rem)" }}
            >
              <div className="overflow-y-auto h-full">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                      <th className="px-5 py-3">Student</th>
                      <th className="px-5 py-3">Topic</th>
                      <th className="px-5 py-3 text-right">Messages</th>
                      <th className="px-5 py-3 text-right">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.chats.map((chat) => (
                      <tr
                        key={chat.id}
                        className={`border-b border-zinc-50 last:border-0 cursor-pointer transition-colors ${
                          activeChatId === chat.id
                            ? "bg-blue-50/60"
                            : "hover:bg-zinc-50/50"
                        }`}
                        onClick={() => navigate({ to: `/guru/${chat.id}` })}
                      >
                        <td className="px-5 py-3">
                          <div className="font-medium text-zinc-900">
                            {chat.studentName ?? "Unknown"}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {chat.studentEmail}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-zinc-600">
                          {chat.title}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-zinc-600">
                          {chat.messageCount}
                        </td>
                        <td className="px-5 py-3 text-right text-zinc-400">
                          {chat.lastMessageAt
                            ? formatRelativeTime(chat.lastMessageAt)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                    {data.chats.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-12 text-center text-zinc-400"
                        >
                          No chat sessions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      <Outlet />
    </>
  );
}
