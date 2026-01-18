import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { cn } from "@/utils/cn";

export const Route = createFileRoute("/_authenticated/student/universities")({
  component: UniversitiesLayout,
});

function UniversitiesLayout() {
  const route = useMatchRoute();

  const isExplorer = route({ to: "/student/universities/explorer" });
  const isShortlist = route({ to: "/student/universities/shortlist" });

  return (
    <div className="w-full h-screen overflow-auto flex flex-col bg-zinc-50">
      {/* Header with Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 shadow-sm">
        <div className="px-6 py-6">
          <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight mb-2">
            Universities
          </h1>
          <p className="text-zinc-500">
            Explore universities and manage your shortlist
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex gap-2 border-b border-zinc-200">
            <Link
              to="/student/universities/explorer"
              className={cn(
                "px-4 py-3 font-medium text-sm transition-colors relative",
                isExplorer
                  ? "text-blue-600"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Explore Universities
              {isExplorer && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </Link>
            <Link
              to="/student/universities/shortlist"
              className={cn(
                "px-4 py-3 font-medium text-sm transition-colors relative",
                isShortlist
                  ? "text-blue-600"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              My Shortlist
              {isShortlist && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <Outlet />
    </div>
  );
}
