import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import {
  MagnifyingGlass,
  FunnelSimple,
  MapPin,
  GraduationCap,
  X,
  GlobeHemisphereWest,
  Buildings,
  CurrencyDollar,
  ChartLine,
  Users,
} from "@phosphor-icons/react";

export const Route = createFileRoute(
  "/_authenticated/student/universities/explorer"
)({
  component: CollegesPage,
});

function CollegesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<any>(null);
  const [filters, setFilters] = useState({
    state: undefined as string | undefined,
    campusSetting: undefined as
      | "City"
      | "Suburban"
      | "Town"
      | "Rural"
      | undefined,
    maxTuition: undefined as number | undefined,
    minAdmissionRate: undefined as number | undefined,
    maxAdmissionRate: undefined as number | undefined,
    minSAT: undefined as number | undefined,
    maxSAT: undefined as number | undefined,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const collegesQuery = useQuery({
    ...orpc.college.searchScorecard.queryOptions({
      input: {
        search: debouncedSearch || undefined,
        state: filters.state,
        campusSetting: filters.campusSetting,
        maxTuition: filters.maxTuition,
        minAdmissionRate: filters.minAdmissionRate,
        maxAdmissionRate: filters.maxAdmissionRate,
        minSAT: filters.minSAT,
        maxSAT: filters.maxSAT,
        limit: 200,
      },
    }),
  });

  const colleges = collegesQuery.data?.colleges || [];
  const isLoading = collegesQuery.isLoading;
  const totalCount = collegesQuery.data?.total || 0;

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
                      Campus Setting
                    </label>
                    <select
                      value={filters.campusSetting || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          campusSetting: (e.target.value as any) || undefined,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">All</option>
                      <option value="City">City</option>
                      <option value="Suburban">Suburban</option>
                      <option value="Town">Town</option>
                      <option value="Rural">Rural</option>
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
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                      Acceptance Rate
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min %"
                        min="0"
                        max="100"
                        value={
                          filters.minAdmissionRate
                            ? filters.minAdmissionRate * 100
                            : ""
                        }
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minAdmissionRate: e.target.value
                              ? Number(e.target.value) / 100
                              : undefined,
                          })
                        }
                        className="w-1/2 px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Max %"
                        min="0"
                        max="100"
                        value={
                          filters.maxAdmissionRate
                            ? filters.maxAdmissionRate * 100
                            : ""
                        }
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            maxAdmissionRate: e.target.value
                              ? Number(e.target.value) / 100
                              : undefined,
                          })
                        }
                        className="w-1/2 px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
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
                          minSAT: undefined,
                          maxSAT: undefined,
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
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-80">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400 mb-4"></div>
                <div className="text-zinc-500 text-sm">Loading...</div>
              </div>
            ) : colleges.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <GraduationCap
                  size={40}
                  className="mb-3 text-zinc-300"
                />
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
                  {colleges.length} of {totalCount} universities
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colleges.map((college: any) => (
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

function CollegeCard({
  college,
  onClick,
}: {
  college: any;
  onClick: () => void;
}) {
  const name = college.name;
  const location =
    college.city && college.state
      ? `${college.city}, ${college.state}`
      : college.state || college.city || "—";

  // Determine selectivity color based on admission rate
  const getSelectivityColor = (rate: number) => {
    if (rate < 0.15) return "bg-blue-500";
    if (rate < 0.30) return "bg-blue-400";
    if (rate < 0.50) return "bg-blue-300";
    return "bg-blue-200";
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg border border-zinc-200 p-4 hover:border-blue-200 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        {college.admissionRate && (
          <div className={`w-1 h-12 rounded-full ${getSelectivityColor(college.admissionRate)} flex-shrink-0`} />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-zinc-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 pt-3 mt-3 border-t border-zinc-100 text-xs">
        {college.tuition && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Tuition</span>
            <span className="font-medium text-zinc-900">
              ${Number(college.tuition).toLocaleString()}
            </span>
          </div>
        )}
        {college.admissionRate && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Acceptance</span>
            <span className="font-medium text-blue-600">
              {(college.admissionRate * 100).toFixed(0)}%
            </span>
          </div>
        )}
        {college.satAverage && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Avg SAT</span>
            <span className="font-medium text-zinc-900">
              {college.satAverage}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

function CollegeModal({
  college,
  onClose,
}: {
  college: any;
  onClose: () => void;
}) {
  const name = college.name;
  const location =
    college.city && college.state
      ? `${college.city}, ${college.state}`
      : college.state || college.city || "—";

  // Get selectivity label and color
  const getSelectivity = (rate: number) => {
    if (rate < 0.10) return { label: "Highly Selective", color: "bg-blue-600 text-white" };
    if (rate < 0.20) return { label: "Very Selective", color: "bg-blue-500 text-white" };
    if (rate < 0.40) return { label: "Selective", color: "bg-blue-100 text-blue-700" };
    return { label: "Accessible", color: "bg-zinc-100 text-zinc-700" };
  };

  const selectivity = college.admissionRate ? getSelectivity(college.admissionRate) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors"
        >
          <X size={18} className="text-zinc-600" />
        </button>

        <div className="overflow-y-auto max-h-[85vh]">
          {/* Header */}
          <div className="p-6 border-b border-zinc-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 pr-8">{name}</h2>
                <div className="flex items-center gap-1.5 text-zinc-500 text-sm mt-1">
                  <MapPin size={14} />
                  <span>{location}</span>
                </div>
              </div>
              {selectivity && (
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${selectivity.color} whitespace-nowrap`}>
                  {selectivity.label}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quick Info */}
            {(college.website || college.campusSetting) && (
              <div className="grid grid-cols-2 gap-3">
                {college.website && (
                  <div className="p-3 bg-zinc-50 rounded-lg">
                    <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                      <GlobeHemisphereWest size={14} />
                      <span className="text-xs">Website</span>
                    </div>
                    <a
                      href={`https://${college.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {college.website}
                    </a>
                  </div>
                )}
                {college.campusSetting && (
                  <div className="p-3 bg-zinc-50 rounded-lg">
                    <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                      <Buildings size={14} />
                      <span className="text-xs">Setting</span>
                    </div>
                    <div className="text-sm font-medium text-zinc-900">
                      {college.campusSetting}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {college.tuition && (
                <div className="p-3 border border-zinc-200 rounded-lg">
                  <div className="flex items-center gap-1 text-zinc-400 mb-1">
                    <CurrencyDollar size={14} />
                    <span className="text-xs">Tuition</span>
                  </div>
                  <div className="text-base font-semibold text-zinc-900">
                    ${Number(college.tuition).toLocaleString()}
                  </div>
                </div>
              )}
              {college.admissionRate && (
                <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-1 text-blue-500 mb-1">
                    <ChartLine size={14} />
                    <span className="text-xs">Acceptance</span>
                  </div>
                  <div className="text-base font-semibold text-blue-600">
                    {(college.admissionRate * 100).toFixed(1)}%
                  </div>
                </div>
              )}
              {college.studentSize && (
                <div className="p-3 border border-zinc-200 rounded-lg">
                  <div className="flex items-center gap-1 text-zinc-400 mb-1">
                    <Users size={14} />
                    <span className="text-xs">Students</span>
                  </div>
                  <div className="text-base font-semibold text-zinc-900">
                    {Number(college.studentSize).toLocaleString()}
                  </div>
                </div>
              )}
              {college.graduationRate && (
                <div className="p-3 border border-zinc-200 rounded-lg">
                  <div className="flex items-center gap-1 text-zinc-400 mb-1">
                    <GraduationCap size={14} />
                    <span className="text-xs">Graduation</span>
                  </div>
                  <div className="text-base font-semibold text-zinc-900">
                    {(college.graduationRate * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            {/* Academic Metrics */}
            {(college.satAverage ||
              college.retentionRate ||
              college.postGradEarnings) && (
              <div className="p-4 bg-zinc-50 rounded-lg">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
                  Academic Metrics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {college.satAverage && (
                    <div>
                      <div className="text-xs text-zinc-500 mb-0.5">
                        Avg SAT
                      </div>
                      <div className="text-lg font-semibold text-zinc-900">
                        {college.satAverage}
                      </div>
                    </div>
                  )}
                  {college.retentionRate && (
                    <div>
                      <div className="text-xs text-zinc-500 mb-0.5">
                        Retention
                      </div>
                      <div className="text-lg font-semibold text-zinc-900">
                        {(college.retentionRate * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  {college.postGradEarnings && (
                    <div>
                      <div className="text-xs text-zinc-500 mb-0.5">
                        Earnings (10yr)
                      </div>
                      <div className="text-lg font-semibold text-zinc-900">
                        ${Number(college.postGradEarnings).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
