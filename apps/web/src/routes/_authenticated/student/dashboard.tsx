import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc } from "orpc/client";
import { useAuthUser } from "@/routes/_authenticated";
import {
  BrainIcon,
  ChalkboardTeacherIcon,
  GraduationCapIcon,
  ArrowRightIcon,
  PencilIcon,
  ChartLineIcon,
  LockIcon,
  HeadsetIcon,
  ClockIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/student/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthUser();

  // Fetch assigned advisor info
  const advisorQuery = useQuery(
    orpc.student.getMyAdvisor.queryOptions({ input: {} })
  );

  // Fetch recent sessions
  const sessionsQuery = useQuery(
    orpc.student.getMySessions.queryOptions({ input: {} })
  );

  const advisor = advisorQuery.data;
  const sessions = sessionsQuery.data ?? [];
  const recentSessions = sessions.slice(0, 3);

  return (
    <div className="flex flex-1 h-screen text-left bg-zinc-50">
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <div className="px-8 pt-12 pb-8 bg-white border-b border-zinc-200">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="text-zinc-500 mt-2">
              Your personalized college application workspace
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-8 max-w-7xl w-full mx-auto">
          {/* Primary Actions - Most Used Features */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Get Started
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/guru"
                className="block bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-[1.01] transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <BrainIcon className="size-10" weight="duotone" />
                  <ArrowRightIcon className="size-6 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-semibold text-xl mb-1">Chat with Guru</div>
                <div className="text-blue-100">
                  Get instant AI-powered guidance on your college applications
                </div>
              </Link>

              <Link
                to="/student/universities/explorer"
                className="block bg-white rounded-xl p-6 border-2 border-zinc-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <GraduationCapIcon className="size-7 text-blue-600" weight="duotone" />
                  </div>
                  <ArrowRightIcon className="size-6 text-zinc-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                </div>
                <div className="font-semibold text-xl text-zinc-900 mb-1">
                  Explore Universities
                </div>
                <div className="text-zinc-600">
                  Discover and research universities in the US and UK
                </div>
              </Link>
            </div>
          </div>

          {/* Info Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Advisor Card - Compact */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <ChalkboardTeacherIcon className="size-5 text-zinc-400" />
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
                  Your Advisor
                </h3>
              </div>
              {advisorQuery.isLoading ? (
                <div className="text-sm text-zinc-400">Loading...</div>
              ) : advisor ? (
                <div className="text-lg font-semibold text-zinc-900">
                  {advisor.advisorName}
                </div>
              ) : (
                <div className="text-zinc-400">Not assigned yet</div>
              )}
            </div>

            {/* Quick Link to Profile */}
            <Link
              to="/student/profile"
              className="bg-white rounded-xl border border-zinc-200 p-6 hover:border-zinc-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-100 rounded-lg">
                    <UserIcon className="size-5 text-zinc-600" weight="duotone" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-0.5">
                      Your Profile
                    </div>
                    <div className="text-lg font-semibold text-zinc-900">
                      {user?.name || user?.email || "Student"}
                    </div>
                  </div>
                </div>
                <ArrowRightIcon className="size-5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Recent Sessions */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Recent Sessions
              </h2>
              {sessions.length > 3 && (
                <Link
                  to="/student/sessions"
                  className="text-sm text-zinc-500 hover:text-zinc-900 font-medium flex items-center gap-1 group"
                >
                  View all
                  <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {sessionsQuery.isLoading ? (
              <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center text-zinc-400">
                Loading sessions...
              </div>
            ) : recentSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentSessions.map((session) => (
                  <Link
                    key={session.id}
                    to="/student/sessions/$sessionId"
                    params={{ sessionId: session.id }}
                    className="block bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <HeadsetIcon className="size-6 text-zinc-400" weight="duotone" />
                      <ArrowRightIcon className="size-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="font-medium text-zinc-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <ClockIcon className="size-3.5" />
                      {format(
                        new Date(session.createdAt ?? new Date()),
                        "MMM d, yyyy"
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
                <HeadsetIcon className="size-12 text-zinc-300 mx-auto mb-4" weight="duotone" />
                <p className="text-zinc-900 font-medium mb-1">
                  No sessions yet
                </p>
                <p className="text-sm text-zinc-500">
                  Your sessions with your advisor will appear here
                </p>
              </div>
            )}
          </div>

          {/* All Tools */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              All Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* University Explorer - Already featured above, so minimal here */}
              <Link
                to="/student/universities/explorer"
                className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <GraduationCapIcon className="size-5 text-blue-600" weight="duotone" />
                  </div>
                  <ArrowRightIcon className="size-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  University Explorer
                </h3>
                <p className="text-zinc-600 text-sm">
                  Browse US & UK universities
                </p>
              </Link>

              {/* Essay Writing */}
              <Link
                to="/essays"
                className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <PencilIcon className="size-5 text-purple-600" weight="duotone" />
                  </div>
                  <ArrowRightIcon className="size-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  Essay Writing
                </h3>
                <p className="text-zinc-600 text-sm">
                  Draft your college essays
                </p>
              </Link>

              {/* Aptitude Test - Coming Soon */}
              <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-5 opacity-60 cursor-not-allowed">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-zinc-100 rounded-lg">
                    <ChartLineIcon className="size-5 text-zinc-400" weight="duotone" />
                  </div>
                  <LockIcon className="size-4 text-zinc-400" />
                </div>
                <h3 className="font-semibold text-zinc-500 mb-1">
                  Aptitude Test
                </h3>
                <p className="text-zinc-500 text-sm">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
