import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { orpc, client } from "orpc/client";
import { SessionManager } from "@/features/aptitude/components/SessionManager";
import { PlusIcon, ArrowLeftIcon } from "@phosphor-icons/react";

export const Route = createFileRoute(
  "/_authenticated/student/aptitude/"
)({
  component: AptitudeIndexPage,
});

function AptitudeIndexPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery(
    orpc.aptitude.list.queryOptions({ input: {} })
  );

  const limitQuery = useQuery(
    orpc.aptitude.checkLimit.queryOptions({ input: {} })
  );

  const createMutation = useMutation({
    mutationFn: async () => client.aptitude.create({}),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["aptitude"] });
      navigate({
        to: "/student/aptitude/$sessionId",
        params: { sessionId: session.id },
      });
    },
  });

  const sessions = sessionsQuery.data ?? [];
  const canCreateNew = limitQuery.data?.canCreateNew ?? false;

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 text-left">
      {/* Back Navigation */}
      <div className="flex items-center">
        <Link
          to="/student/dashboard"
          className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
              Aptitude Test
            </h1>
            <p className="text-zinc-500 mt-1">
              Discover your academic interests and find your ideal career path
            </p>
            <p className="text-zinc-400 text-sm mt-1">
              You can take up to 3 aptitude tests
            </p>
          </div>
          {canCreateNew && (
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <PlusIcon className="size-5" />
              {createMutation.isPending ? "Creating..." : "Start New Test"}
            </button>
          )}
        </div>
      </div>

      {/* Sessions */}
      <SessionManager
        sessions={sessions}
        isLoading={sessionsQuery.isLoading}
        limitInfo={limitQuery.data}
        onSelectSession={(id) =>
          navigate({
            to: "/student/aptitude/$sessionId",
            params: { sessionId: id },
          })
        }
      />
    </div>
  );
}
