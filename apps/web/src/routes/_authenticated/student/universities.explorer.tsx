import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  MagnifyingGlass,
  FunnelSimple,
  GraduationCap,
} from "@phosphor-icons/react";

import { type College } from "@/features/college/types";
import { CollegeCard } from "@/features/college/college-card";
import { CollegeModal } from "@/features/college/college-modal";
import {
  getAllUSColleges,
  filterUSColleges,
  getUSCollegeStates,
  getUSCollegeCampusSettings,
} from "@/features/college/us-colleges";

export const Route = createFileRoute(
  "/_authenticated/student/universities/explorer"
)({
  component: CollegesPage,
});

function CollegesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [filters, setFilters] = useState({
    state: undefined as string | undefined,
    campusSetting: undefined as string | undefined,
    maxTuition: undefined as number | undefined,
    minAdmissionRate: undefined as number | undefined,
    maxAdmissionRate: undefined as number | undefined,
  });

  // Get all available filter options from local data
  const availableStates = useMemo(() => getUSCollegeStates(), []);
  const availableCampusSettings = useMemo(() => getUSCollegeCampusSettings(), []);

  // Filter colleges from local JSON data
  const colleges = useMemo(() => {
    return filterUSColleges({
      search: searchQuery || undefined,
      states: filters.state ? [filters.state] : undefined,
      campusSetting: filters.campusSetting ? [filters.campusSetting] : undefined,
      maxTuition: filters.maxTuition,
      minAdmissionRate: filters.minAdmissionRate,
      maxAdmissionRate: filters.maxAdmissionRate,
    }) as College[];
  }, [searchQuery, filters]);

  const totalColleges = getAllUSColleges().length;

  return (
    <div className="flex-1 flex flex-col bg-zinc-50">
      {/* Search and Filters */}
      <div className="px-6 py-4 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlass
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search universities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all text-sm font-medium ${
                showFilters
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <FunnelSimple size={18} />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    State
                  </label>
                  <select
                    value={filters.state || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        state: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All States</option>
                    {availableStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    Campus Setting
                  </label>
                  <select
                    value={filters.campusSetting || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        campusSetting: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All</option>
                    {availableCampusSettings.map((setting) => (
                      <option key={setting} value={setting}>
                        {setting}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    Max Tuition
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={filters.maxTuition || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxTuition: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() =>
                      setFilters({
                        state: undefined,
                        campusSetting: undefined,
                        maxTuition: undefined,
                        minAdmissionRate: undefined,
                        maxAdmissionRate: undefined,
                      })
                    }
                    className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 font-medium hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 px-6 py-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {colleges.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <GraduationCap size={40} className="mb-3 text-zinc-300" />
              <p className="text-zinc-900 font-medium mb-1">
                No universities found
              </p>
              <p className="text-sm text-zinc-500">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-zinc-500">
                {colleges.length} of {totalColleges} universities
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {colleges.map((college) => (
                  <CollegeCard
                    key={college.id}
                    college={college}
                    onClick={() => setSelectedCollege(college)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedCollege && (
        <CollegeModal
          college={selectedCollege}
          onClose={() => setSelectedCollege(null)}
        />
      )}
    </div>
  );
}
