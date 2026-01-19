import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Users, GraduationCap, DollarSign } from "lucide-react";

export const Route = createFileRoute("/_authenticated/explore")({
  component: ExploreUniversitiesPage,
});

function ExploreUniversitiesPage() {
  const [search, setSearch] = useState("");
  const [state, setState] = useState<string | undefined>();
  const [campusSetting, setCampusSetting] = useState<
    "City" | "Suburban" | "Town" | "Rural" | undefined
  >();
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = trpc.college.list.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
    state,
    campusSetting,
  });

  const formatNumber = (num: string | number | null | undefined) => {
    if (!num) return "N/A";
    const value = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(value)) return "N/A";
    return new Intl.NumberFormat().format(value);
  };

  const formatPercent = (num: string | number | null | undefined) => {
    if (!num) return "N/A";
    const value = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(value)) return "N/A";
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatCurrency = (num: string | number | null | undefined) => {
    if (!num) return "N/A";
    const value = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(value)) return "N/A";
    return `$${new Intl.NumberFormat().format(value)}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Explore Universities
        </h1>
        <p className="text-muted-foreground">
          Discover and compare universities using real data from College
          Scorecard
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find universities that match your criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search universities..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="pl-9"
              />
            </div>

            <Select value={state} onValueChange={(value) => {
              setState(value === "all" ? undefined : value);
              setPage(0);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="AL">Alabama</SelectItem>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="MA">Massachusetts</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={campusSetting}
              onValueChange={(value) => {
                setCampusSetting(
                  value === "all" ? undefined : (value as any)
                );
                setPage(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Campus setting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Settings</SelectItem>
                <SelectItem value="City">City</SelectItem>
                <SelectItem value="Suburban">Suburban</SelectItem>
                <SelectItem value="Town">Town</SelectItem>
                <SelectItem value="Rural">Rural</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading..."
              : `${formatNumber(data?.total)} universities found`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.colleges && data.colleges.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              {data.colleges.map((college: any) => (
                <Card key={college.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">
                          {college.school_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {college.school_city}, {college.school_state}
                        </CardDescription>
                      </div>
                      {college.campus_setting && (
                        <Badge variant="outline">{college.campus_setting}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {college.admission_rate && (
                        <div className="flex items-start gap-2">
                          <GraduationCap className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {formatPercent(college.admission_rate)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Admission Rate
                            </p>
                          </div>
                        </div>
                      )}

                      {college.student_size && (
                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {formatNumber(college.student_size)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Students
                            </p>
                          </div>
                        </div>
                      )}

                      {college.tuition && (
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {formatCurrency(college.tuition)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Annual Tuition
                            </p>
                          </div>
                        </div>
                      )}

                      {college.sat_average && (
                        <div className="flex items-start gap-2">
                          <GraduationCap className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {formatNumber(college.sat_average)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Avg SAT
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      {college.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={
                              college.website.startsWith("http")
                                ? college.website
                                : `https://${college.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Website
                          </a>
                        </Button>
                      )}
                      <Button variant="default" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data?.hasMore}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No universities found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
