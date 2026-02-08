import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounceValue } from "usehooks-ts";
import {
  MagnifyingGlass,
  FunnelSimple,
  GraduationCap,
  Spinner,
} from "@phosphor-icons/react";

import { orpc } from "orpc/client";
import { type College, type UKCollegeData } from "@/features/college/types";
import { CollegeCard } from "@/features/college/college-card";
import { CollegeModal } from "@/features/college/college-modal";

export const Route = createFileRoute(
  "/_authenticated/student/universities/explorer"
)({
  component: CollegesPage,
});

type Country = "us" | "uk";

function CollegesPage() {
  const [country, setCountry] = useState<Country>("us");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounceValue(searchQuery, 300);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<
    College | UKCollegeData | null
  >(null);
  const [filters, setFilters] = useState({
    state: undefined as string | undefined,
    location: undefined as string | undefined,
    campusSetting: undefined as string | undefined,
    citySize: undefined as string | undefined,
    maxTuition: undefined as number | undefined,
    minAdmissionRate: undefined as number | undefined,
    maxAdmissionRate: undefined as number | undefined,
  });
  const [offset, setOffset] = useState(0);
  const [allColleges, setAllColleges] = useState<(College | UKCollegeData)[]>(
    []
  );

  // Fetch filter options
  const filterOptionsQuery = useQuery(
    orpc.college.getFilterOptions.queryOptions({ input: {} })
  );

  const availableStates = filterOptionsQuery.data?.usStates ?? [];
  const availableLocations = filterOptionsQuery.data?.ukLocations ?? [];
  const availableCampusSettings = filterOptionsQuery.data?.campusSettings ?? [];
  const availableCitySizes = filterOptionsQuery.data?.citySizes ?? [];

  // Reset pagination when filters, search, or country change
  useEffect(() => {
    setOffset(0);
    setAllColleges([]);
  }, [
    debouncedSearch,
    filters.state,
    filters.location,
    filters.campusSetting,
    filters.citySize,
    filters.maxTuition,
    filters.minAdmissionRate,
    filters.maxAdmissionRate,
    country,
  ]);

  // Fetch US colleges
  const usCollegesQuery = useQuery({
    ...orpc.college.searchUS.queryOptions({
      input: {
        search: debouncedSearch || undefined,
        states: filters.state ? [filters.state] : undefined,
        campusSetting: filters.campusSetting
          ? [filters.campusSetting]
          : undefined,
        maxTuition: filters.maxTuition,
        minAdmissionRate: filters.minAdmissionRate,
        maxAdmissionRate: filters.maxAdmissionRate,
        limit: 50,
        offset: offset,
      },
    }),
    enabled: country === "us",
  });

  // Fetch UK colleges
  const ukCollegesQuery = useQuery({
    ...orpc.college.searchUK.queryOptions({
      input: {
        search: debouncedSearch || undefined,
        locations: filters.location ? [filters.location] : undefined,
        citySize: filters.citySize ? [filters.citySize] : undefined,
        maxTuition: filters.maxTuition,
        limit: 50,
        offset: offset,
      },
    }),
    enabled: country === "uk",
  });

  const activeQuery = country === "us" ? usCollegesQuery : ukCollegesQuery;
  const newColleges = activeQuery.data?.colleges ?? [];
  const total = activeQuery.data?.total ?? 0;
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;

  // Accumulate colleges when new data arrives
  useEffect(() => {
    if (newColleges.length > 0) {
      if (offset === 0) {
        // Reset if starting fresh
        setAllColleges(newColleges);
      } else {
        // Append new colleges, avoiding duplicates
        setAllColleges((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newOnes = newColleges.filter((c) => !existingIds.has(c.id));
          return [...prev, ...newOnes];
        });
      }
    }
  }, [newColleges, offset]);

  const colleges = allColleges;
  const hasMore = colleges.length < total && total > 0;

  const handleClearFilters = () => {
    setFilters({
      state: undefined,
      location: undefined,
      campusSetting: undefined,
      citySize: undefined,
      maxTuition: undefined,
      minAdmissionRate: undefined,
      maxAdmissionRate: undefined,
    });
  };

  const handleLoadMore = () => {
    setOffset((prev) => prev + 50);
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-50">
      {/* Search and Filters */}
      <div className="px-6 py-4 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto">
          {/* Country Toggle */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setCountry("us")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                country === "us"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              US Universities
            </button>
            <button
              onClick={() => setCountry("uk")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                country === "uk"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              UK Universities
            </button>
          </div>

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
                {country === "us" ? (
                  <>
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
                        {availableStates
                          .filter((state): state is string => Boolean(state))
                          .map((state) => (
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
                        {availableCampusSettings
                          .filter((setting): setting is string =>
                            Boolean(setting)
                          )
                          .map((setting) => (
                            <option key={setting} value={setting}>
                              {setting}
                            </option>
                          ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                        Location
                      </label>
                      <select
                        value={filters.location || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            location: e.target.value || undefined,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">All Locations</option>
                        {availableLocations
                          .filter((loc): loc is string => Boolean(loc))
                          .map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                        City Size
                      </label>
                      <select
                        value={filters.citySize || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            citySize: e.target.value || undefined,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">All</option>
                        {availableCitySizes
                          .filter((size): size is string => Boolean(size))
                          .map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                      </select>
                    </div>
                  </>
                )}
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
                    onClick={handleClearFilters}
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
          {isLoading && offset === 0 ? (
            <div className="flex flex-col items-center justify-center h-80">
              <Spinner size={40} className="mb-3 text-blue-500 animate-spin" />
              <p className="text-zinc-500">Loading universities...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <p className="text-red-600 font-medium mb-1">
                Error loading universities
              </p>
              <p className="text-sm text-zinc-500">Please try again later</p>
            </div>
          ) : colleges.length === 0 ? (
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
                Showing {colleges.length} of {total} universities
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {colleges.map((college) => (
                  <CollegeCard
                    key={college.id}
                    country={country}
                    college={college as any}
                    onClick={() => setSelectedCollege(college)}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex flex-col items-center justify-center py-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          size={18}
                          className="inline-block mr-2 animate-spin"
                        />
                        Loading...
                      </>
                    ) : (
                      "Load More Universities"
                    )}
                  </button>
                </div>
              )}

              {!hasMore && colleges.length > 0 && (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-sm text-zinc-500">
                    You've reached the end. All {total} universities are
                    displayed.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedCollege && (
        <CollegeModal
          college={selectedCollege as College}
          onClose={() => setSelectedCollege(null)}
        />
      )}
    </div>
  );
}
