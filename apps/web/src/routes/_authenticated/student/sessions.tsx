import {
  createFileRoute,
  Outlet,
  useMatchRoute,
  useParams,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { MySessionTable } from "@/features/tables/my-session";
import { MySessionsTab } from "@/features/user-tabs/my-sessions";
import { CalendarIcon, HeadsetIcon, LockIcon } from "@phosphor-icons/react";
import { PageLoader } from "@/components/page-loader";

const CALENDLY_URL = "https://calendly.com/team-studentize/new-meeting";

export const Route = createFileRoute("/_authenticated/student/sessions")({
  component: SessionsPage,
});

function SessionsPage() {
  const route = useMatchRoute();

  const params = useParams({
    from: "/_authenticated/student/sessions/$sessionId",
    shouldThrow: false,
  });

  const isSessionDetail = route({ to: "/student/sessions/$sessionId" });

  // Fetch student profile to check tier
  const profileQuery = useQuery(
    orpc.student.getMyProfile.queryOptions({ input: {} })
  );
  const isFreeUser = !profileQuery.data?.tier || profileQuery.data.tier === "FREE";

  const sessionsQuery = useQuery(
    orpc.student.getMySessions.queryOptions({ input: {} })
  );

  const sessions = sessionsQuery.data ?? [];

  const isLoading = profileQuery.isLoading || sessionsQuery.isLoading;

  if (isSessionDetail) {
    return <Outlet />;
  }

  if (isLoading) {
    return <PageLoader message="Loading sessions..." />;
  }

  // Show locked page for free users
  if (isFreeUser) {
    return (
      <div className="flex flex-1 h-screen items-center justify-center bg-zinc-50">
        <div className="max-w-md text-center p-8">
          <div className="mx-auto w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
            <LockIcon className="size-10 text-zinc-400" weight="fill" />
          </div>

          <h1 className="text-2xl font-semibold text-zinc-900 mb-3">
            Sessions Locked
          </h1>

          <p className="text-zinc-600 mb-6">
            Session recordings and summaries are available for students working with our advisors.
            Book a free consultation to get started on your college application journey.
          </p>

          <div className="space-y-3">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <CalendarIcon className="size-5" weight="bold" />
              Book Free Consultation
            </a>
          </div>

          <div className="mt-8 p-4 bg-white rounded-xl border border-zinc-200">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-blue-50 rounded-lg">
                <HeadsetIcon className="size-5 text-blue-600" weight="duotone" />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-900">What you'll get</div>
                <div className="text-xs text-zinc-500">
                  1-on-1 sessions, recordings, AI summaries, and personalized guidance
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 h-screen text-left gap-4">
        <div className="flex-1 flex-col flex p-4 pt-2.5">
          <div className="flex items-center justify-between p-2.5">
            <div>Sessions</div>
          </div>
          <div className="rounded-md bg-white flex-1 flex flex-col border border-bzinc overflow-hidden">
            <MySessionTable
              data={sessions}
              isError={sessionsQuery.isError}
              isLoading={sessionsQuery.isPending}
              currentSessionId={params?.sessionId}
            />
          </div>
        </div>
        <div className="w-[35rem] bg-white border-l border-bzinc flex flex-col text-left">
          <div className="flex-1 overflow-auto custom-scrollbar">
            {params?.sessionId ? (
              <MySessionsTab sessionId={params.sessionId} />
            ) : (
              <div className="p-6 text-center text-zinc-500">
                Select a session to view details
              </div>
            )}
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
