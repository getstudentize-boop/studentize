import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { orpc } from "orpc/client";
import { SectionSkeleton } from "./section-skeleton";
import {
  HeadsetIcon,
  ArrowRightIcon,
  ClockIcon,
  CalendarIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";

export function SessionsSection() {
  const profileQuery = useQuery(
    orpc.student.getMyProfile.queryOptions({ input: {} }),
  );
  const sessionsQuery = useQuery(
    orpc.student.getMySessions.queryOptions({ input: {} }),
  );

  const isFreeUser =
    !profileQuery.data?.tier || profileQuery.data.tier === "FREE";
  const sessions = sessionsQuery.data ?? [];
  const recentSessions = sessions.slice(0, 3);

  if (profileQuery.isLoading || sessionsQuery.isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Recent Sessions
        </h2>
        <SectionSkeleton />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">
          Recent Sessions
        </h2>
        {sessions.length > 3 && !isFreeUser && (
          <Link
            to="/student/sessions"
            className="text-sm text-zinc-500 hover:text-zinc-900 font-medium flex items-center gap-1 group"
          >
            View all
            <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {isFreeUser ? (
        <div className="bg-white rounded-xl border border-zinc-200 relative overflow-hidden min-h-64">
          {/* Blurred placeholder sessions */}
          <div className="filter blur-sm pointer-events-none select-none p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-zinc-50 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <HeadsetIcon
                      className="size-6 text-zinc-300"
                      weight="duotone"
                    />
                  </div>
                  <div className="h-4 bg-zinc-200 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-zinc-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>

          {/* Consultation placard overlay */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center px-6 text-center">
            <div className="p-3 bg-blue-50 rounded-full mb-3">
              <CalendarIcon
                className="size-7 text-blue-600"
                weight="duotone"
              />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">
              Book Your Free 1-on-1 Consultation
            </h3>
            <p className="text-sm text-zinc-500 max-w-sm mb-4">
              Get personalized guidance from the Studentize team to kickstart
              your college application journey.
            </p>
            <a
              href="https://calendly.com/team-studentize/new-meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CalendarIcon className="size-4" weight="bold" />
              Schedule Free Consultation
            </a>
          </div>
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
                <HeadsetIcon
                  className="size-6 text-zinc-400"
                  weight="duotone"
                />
                <ArrowRightIcon className="size-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="font-medium text-zinc-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {session.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <ClockIcon className="size-3.5" />
                {format(
                  new Date(session.createdAt ?? new Date()),
                  "MMM d, yyyy",
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
          <HeadsetIcon
            className="size-10 text-zinc-300 mx-auto mb-3"
            weight="duotone"
          />
          <p className="text-zinc-900 font-medium mb-1">No sessions yet</p>
          <p className="text-sm text-zinc-500">
            Your sessions with your advisor will appear here
          </p>
        </div>
      )}
    </div>
  );
}
