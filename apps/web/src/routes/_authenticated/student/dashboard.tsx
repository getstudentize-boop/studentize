import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthUser } from "@/routes/_authenticated";
import { UpgradeModal } from "@/components/upgrade-modal";
import { TasksSection } from "@/features/dashboard/tasks-section";
import { AdvisorCard } from "@/features/dashboard/advisor-card";
import { SessionsSection } from "@/features/dashboard/sessions-section";
import { ScoresSection } from "@/features/dashboard/scores-section";
import { orpc } from "orpc/client";
import {
  BrainIcon,
  GraduationCapIcon,
  ArrowRightIcon,
  PencilIcon,
  ChartLineIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/student/dashboard")({
  component: RouteComponent,
  loader: ({ context }) => {
    // Prefetch all dashboard data in parallel at the route level
    // so queries start before components mount
    context.queryClient.ensureQueryData(
      orpc.student.getMyProfile.queryOptions({ input: {} }),
    );
    context.queryClient.ensureQueryData(
      orpc.student.getMyAdvisor.queryOptions({ input: {} }),
    );
    context.queryClient.ensureQueryData(
      orpc.student.getMySessions.queryOptions({ input: {} }),
    );
    context.queryClient.ensureQueryData(
      orpc.task.list.queryOptions({ input: {} }),
    );
    context.queryClient.ensureQueryData(
      orpc.score.list.queryOptions({ input: {} }),
    );
  },
});

function RouteComponent() {
  const { user } = useAuthUser();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

  const handleUpgrade = (feature: string) => {
    setUpgradeFeature(feature);
    setShowUpgradeModal(true);
  };

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
          {/* Top Row: Quick Actions + My Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column: Quick Actions */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Quick Actions
              </h2>
              <Link
                to="/guru"
                className="block bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.01] transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <BrainIcon className="size-8" weight="duotone" />
                  <ArrowRightIcon className="size-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-semibold text-lg mb-0.5">
                  Chat with Guru
                </div>
                <div className="text-blue-100 text-sm">
                  AI-powered guidance for applications
                </div>
              </Link>

              <Link
                to="/student/universities/explorer"
                className="block bg-white rounded-xl p-5 border-2 border-zinc-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <GraduationCapIcon
                      className="size-6 text-blue-600"
                      weight="duotone"
                    />
                  </div>
                  <ArrowRightIcon className="size-5 text-zinc-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                </div>
                <div className="font-semibold text-zinc-900 mb-0.5">
                  Explore Universities
                </div>
                <div className="text-zinc-600 text-sm">
                  Discover US and UK universities
                </div>
              </Link>
            </div>

            {/* Right Column: My Tasks */}
            <TasksSection />
          </div>

          {/* Info Cards Row - Full Width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Advisor Card */}
            <AdvisorCard onUpgrade={handleUpgrade} />

            {/* Profile Card */}
            <Link
              to="/student/profile"
              className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-100 rounded-lg">
                    <UserIcon
                      className="size-5 text-zinc-600"
                      weight="duotone"
                    />
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
          <SessionsSection />

          {/* Scores Section */}
          {/* <ScoresSection /> */}

          {/* Upgrade Modal */}
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            featureName={upgradeFeature}
          />

          {/* All Tools */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              All Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/student/universities/explorer"
                className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <GraduationCapIcon
                      className="size-5 text-blue-600"
                      weight="duotone"
                    />
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

              <Link
                to="/essays"
                className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <PencilIcon
                      className="size-5 text-purple-600"
                      weight="duotone"
                    />
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

              <Link
                to="/student/aptitude"
                className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <ChartLineIcon
                      className="size-5 text-amber-600"
                      weight="duotone"
                    />
                  </div>
                  <ArrowRightIcon className="size-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  Aptitude Test
                </h3>
                <p className="text-zinc-600 text-sm">
                  Discover your career path
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
