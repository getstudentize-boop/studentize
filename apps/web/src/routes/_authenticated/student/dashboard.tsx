import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc } from "orpc/client";
import { useAuthUser } from "@/routes/_authenticated";
import {
  BrainIcon,
  ChalkboardTeacherIcon,
  EnvelopeIcon,
  MapPinIcon,
  GraduationCapIcon,
  BookOpenIcon,
  ArrowRightIcon,
  ListBulletsIcon,
  PencilIcon,
  ChartLineIcon,
  LockIcon,
  HeadsetIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/button";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/student/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthUser();

  // Fetch student's own profile data
  const studentQuery = useQuery(
    orpc.student.getMyProfile.queryOptions({ input: {} })
  );

  // Fetch assigned advisor info
  const advisorQuery = useQuery(
    orpc.student.getMyAdvisor.queryOptions({ input: {} })
  );

  // Fetch recent sessions
  const sessionsQuery = useQuery(
    orpc.student.getMySessions.queryOptions({ input: {} })
  );

  const student = studentQuery.data;
  const advisor = advisorQuery.data;
  const sessions = sessionsQuery.data ?? [];
  const recentSessions = sessions.slice(0, 3); // Show 3 most recent sessions

  return (
    <div className="flex flex-1 h-screen text-left">
      <div className="flex-1 flex flex-col p-4 pt-2.5 overflow-auto">
        {/* Header */}
        <div className="p-2.5 mb-4">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-zinc-600 text-sm mt-1">
            Track your progress and stay connected with your advisor
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Profile Card */}
          <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="font-semibold text-base text-zinc-900">
                Your Profile
              </h2>
            </div>
            <div className="p-6">
              {studentQuery.isLoading ? (
                <div className="text-sm text-zinc-500">Loading...</div>
              ) : studentQuery.isError ? (
                <div className="text-sm text-red-600">
                  Error loading profile. Please contact support.
                </div>
              ) : student ? (
                <div className="space-y-4">
                  {user?.email && (
                    <div className="flex gap-3 items-start">
                      <EnvelopeIcon className="size-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                          Email
                        </div>
                        <div className="text-sm text-zinc-900">{user.email}</div>
                      </div>
                    </div>
                  )}
                  {student.location && (
                    <div className="flex gap-3 items-start">
                      <MapPinIcon className="size-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                          Location
                        </div>
                        <div className="text-sm text-zinc-900">
                          {student.location}
                        </div>
                      </div>
                    </div>
                  )}
                  {student.expectedGraduationYear && (
                    <div className="flex gap-3 items-start">
                      <GraduationCapIcon className="size-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                          Expected Graduation
                        </div>
                        <div className="text-sm text-zinc-900">
                          {student.expectedGraduationYear}
                        </div>
                      </div>
                    </div>
                  )}
                  {student.studyCurriculum && (
                    <div className="flex gap-3 items-start">
                      <BookOpenIcon className="size-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                          Curriculum
                        </div>
                        <div className="text-sm text-zinc-900">
                          {student.studyCurriculum}
                        </div>
                      </div>
                    </div>
                  )}
                  {student.areasOfInterest && (
                    <div className="flex gap-3 items-start">
                      <BookOpenIcon className="size-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                          Areas of Interest
                        </div>
                        <div className="text-sm text-zinc-900">
                          {student.areasOfInterest}
                        </div>
                      </div>
                    </div>
                  )}
                  {!student.location &&
                    !student.expectedGraduationYear &&
                    !student.studyCurriculum &&
                    !student.areasOfInterest && (
                      <div className="text-sm text-zinc-500">
                        Your profile is incomplete. Contact your advisor to add more details.
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-sm text-zinc-500">
                  No profile data available. Please contact your advisor.
                </div>
              )}
            </div>
          </div>

          {/* Advisor Card */}
          <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
              <ChalkboardTeacherIcon className="size-4 text-zinc-400" />
              <h2 className="font-semibold text-base text-zinc-900">
                Your Dedicated Advisor
              </h2>
            </div>
            <div className="p-6">
              {advisorQuery.isLoading ? (
                <div className="text-sm text-zinc-500">Loading...</div>
              ) : advisor ? (
                <div>
                  <div className="text-lg font-semibold text-zinc-900 mb-2">
                    {advisor.name || "Not assigned"}
                  </div>
                  <p className="text-sm text-zinc-600">
                    Your advisor is here to help guide you through your academic
                    journey and college application process.
                  </p>
                </div>
              ) : (
                <div className="text-sm text-zinc-500">
                  No advisor assigned yet. An advisor will be assigned to you soon.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="font-semibold text-base text-zinc-900">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <Link to="/guru">
                <Button variant="primary" className="w-full justify-between">
                  <div className="flex items-center gap-3">
                    <BrainIcon className="size-5" />
                    <div className="text-left">
                      <div className="font-semibold">Chat with Guru</div>
                      <div className="text-xs opacity-90">
                        Get AI-powered guidance and support
                      </div>
                    </div>
                  </div>
                  <ArrowRightIcon className="size-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeadsetIcon className="size-4 text-zinc-400" />
                <h2 className="font-semibold text-base text-zinc-900">
                  Recent Sessions
                </h2>
              </div>
              {sessions.length > 3 && (
                <Link
                  to="/student/sessions"
                  className="text-xs text-zinc-500 hover:text-zinc-700 font-medium"
                >
                  View All
                </Link>
              )}
            </div>
            <div className="p-6">
              {sessionsQuery.isLoading ? (
                <div className="text-sm text-zinc-500">Loading sessions...</div>
              ) : recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <Link
                      key={session.sessionId}
                      to="/student/sessions/$sessionId"
                      params={{ sessionId: session.sessionId }}
                      className="block p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-zinc-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {session.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <ClockIcon className="size-3" />
                            {format(
                              new Date(session.createdAt ?? new Date()),
                              "MMM d, yyyy"
                            )}
                          </div>
                        </div>
                        <ArrowRightIcon className="size-4 text-zinc-400 group-hover:text-zinc-600 flex-shrink-0 mt-0.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <HeadsetIcon className="size-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500 mb-1">
                    No sessions yet
                  </p>
                  <p className="text-xs text-zinc-400">
                    Your sessions with your advisor will appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Available Tools Section */}
          <div className="lg:col-span-2 mt-4">
            <h2 className="font-semibold text-base text-zinc-900 mb-4 px-2.5">
              Available Tools
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* University Shortlist */}
              <div className="bg-zinc-50 rounded-md border border-zinc-200 overflow-hidden h-full flex flex-col opacity-60">
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <ListBulletsIcon className="size-5 text-zinc-400" />
                      <h3 className="font-semibold text-base text-zinc-500">
                        University Shortlist
                      </h3>
                    </div>
                    <LockIcon className="size-4 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-500 flex-1">
                    Build and manage your personalized list of target universities
                  </p>
                  <div className="mt-4 text-xs text-zinc-400 font-medium">
                    Coming Soon
                  </div>
                </div>
              </div>

              {/* Essay Writing */}
              <Link to="/essays" className="h-full">
                <div className="bg-white rounded-md border border-zinc-200 overflow-hidden hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer h-full flex flex-col">
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <PencilIcon className="size-5 text-zinc-600" />
                        <h3 className="font-semibold text-base text-zinc-900">
                          Essay Writing
                        </h3>
                      </div>
                      <ArrowRightIcon className="size-5 text-zinc-400" />
                    </div>
                    <p className="text-sm text-zinc-600 flex-1">
                      Write, draft, and refine your college application essays
                    </p>
                    <div className="mt-4 text-xs text-zinc-500 font-medium opacity-0">
                      Coming Soon
                    </div>
                  </div>
                </div>
              </Link>

              {/* Aptitude Test */}
              <div className="bg-zinc-50 rounded-md border border-zinc-200 overflow-hidden h-full flex flex-col opacity-60">
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <ChartLineIcon className="size-5 text-zinc-400" />
                      <h3 className="font-semibold text-base text-zinc-500">
                        Aptitude Test
                      </h3>
                    </div>
                    <LockIcon className="size-4 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-500 flex-1">
                    Assess your strengths and discover the best fit programs
                  </p>
                  <div className="mt-4 text-xs text-zinc-400 font-medium">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
