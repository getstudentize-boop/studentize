import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import {
  GraduationCap,
  Sparkle,
  Plus,
  MapPin,
  Star,
  Trash,
  BookmarkSimple,
  ListChecks,
  ChatCircle,
} from "@phosphor-icons/react";
import { cn } from "@/utils/cn";
import { CollegeCard } from "@/features/college/college-card";
import { CollegeModal } from "@/features/college/college-modal";
import { UKCollegeModal } from "@/features/college/uk-college-modal";
import type { College, UKCollegeData } from "@/features/college/types";

export const Route = createFileRoute(
  "/_authenticated/student/universities/shortlist",
)({
  component: ShortlistPage,
});

type ShortlistCategory = "reach" | "target" | "safety";

interface ShortlistedUniversity {
  id: string;
  name: string;
  location: string;
  imageUrl?: string | null;
  ranking?: string;
  acceptanceRate?: string;
  tuition?: string | null;
  category?: ShortlistCategory | null;
  source: string;
  notes?: string | null;
  virtualAdvisorSessionId?: string | null;
  country: "us" | "uk";
  rawCollege?: unknown;
}

function ShortlistPage() {
  const [activeTab, setActiveTab] = useState<"all" | "ai" | "manual">("all");
  const [selectedCollege, setSelectedCollege] = useState<{
    college: College | UKCollegeData;
    country: "us" | "uk";
  } | null>(null);
  const queryClient = useQueryClient();

  const { data: rawShortlist, isLoading } = useQuery(
    orpc.shortlist.getMyShortlist.queryOptions({ input: {} }),
  );

  const removeMutation = useMutation(
    orpc.shortlist.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.shortlist.getMyShortlist.queryOptions({ input: {} })
            .queryKey,
        });
      },
    }),
  );

  // Map API data to our UI shape
  const shortlist: ShortlistedUniversity[] = (rawShortlist ?? []).map(
    (item) => ({
      id: item.id,
      name: item.college?.name ?? item.collegeId,
      location: item.college?.location ?? item.country.toUpperCase(),
      imageUrl: item.college?.imageUrl,
      ranking: item.college?.ranking ?? undefined,
      acceptanceRate: item.college?.acceptanceRate ?? undefined,
      tuition: item.college?.tuition,
      category: item.category,
      source: item.source,
      notes: item.notes,
      virtualAdvisorSessionId: item.virtualAdvisorSessionId,
      country: item.country as "us" | "uk",
      rawCollege: item.rawCollege,
    }),
  );

  const aiCount = shortlist.filter((u) => u.source === "ai").length;
  const manualCount = shortlist.filter((u) => u.source === "manual").length;

  const filtered =
    activeTab === "ai"
      ? shortlist.filter((u) => u.source === "ai")
      : activeTab === "manual"
        ? shortlist.filter((u) => u.source === "manual")
        : shortlist;

  const reach = filtered.filter((u) => u.category === "reach");
  const target = filtered.filter((u) => u.category === "target");
  const safety = filtered.filter((u) => u.category === "safety");
  const uncategorized = filtered.filter((u) => !u.category);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm text-zinc-500">Loading shortlist...</div>
      </div>
    );
  }

  if (shortlist.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 px-6 py-8 bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        {/* Header with Actions */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              Your University Shortlist
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {shortlist.length} universit{shortlist.length === 1 ? "y" : "ies"}{" "}
              in your shortlist
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/student/universities/explorer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-all font-medium"
            >
              <Plus size={18} weight="bold" />
              Add Universities
            </Link>
            <Link
              to="/student/virtual-advisors/$advisor"
              params={{ advisor: "shortlister" }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-sm"
            >
              <Sparkle size={18} weight="fill" />
              Generate AI Shortlist
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-2.5 font-medium text-sm transition-colors relative",
              activeTab === "all"
                ? "text-blue-600"
                : "text-zinc-600 hover:text-zinc-900",
            )}
          >
            All Universities ({shortlist.length})
            {activeTab === "all" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={cn(
              "px-4 py-2.5 font-medium text-sm transition-colors relative inline-flex items-center gap-2",
              activeTab === "ai"
                ? "text-blue-600"
                : "text-zinc-600 hover:text-zinc-900",
            )}
          >
            <Sparkle size={16} weight="fill" />
            AI Recommendations ({aiCount})
            {activeTab === "ai" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={cn(
              "px-4 py-2.5 font-medium text-sm transition-colors relative inline-flex items-center gap-2",
              activeTab === "manual"
                ? "text-blue-600"
                : "text-zinc-600 hover:text-zinc-900",
            )}
          >
            <BookmarkSimple size={16} weight="fill" />
            My Picks ({manualCount})
            {activeTab === "manual" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Category Sections */}
        <div className="space-y-8">
          <CategorySection
            title="Reach Schools"
            description="Highly competitive schools where admission is challenging"
            color="purple"
            universities={reach}
            onRemove={(id) => removeMutation.mutate({ id })}
            onCollegeClick={setSelectedCollege}
          />
          <CategorySection
            title="Target Schools"
            description="Schools where your profile aligns well with admitted students"
            color="blue"
            universities={target}
            onRemove={(id) => removeMutation.mutate({ id })}
            onCollegeClick={setSelectedCollege}
          />
          <CategorySection
            title="Safety Schools"
            description="Schools where you have a strong chance of admission"
            color="green"
            universities={safety}
            onRemove={(id) => removeMutation.mutate({ id })}
            onCollegeClick={setSelectedCollege}
          />
          {uncategorized.length > 0 && (
            <CategorySection
              title="Uncategorized"
              description="Universities not yet assigned a category"
              color="blue"
              universities={uncategorized}
              onRemove={(id) => removeMutation.mutate({ id })}
              onCollegeClick={setSelectedCollege}
            />
          )}
        </div>
      </div>

      {selectedCollege && selectedCollege.country === "us" && (
        <CollegeModal
          college={selectedCollege.college as College}
          onClose={() => setSelectedCollege(null)}
        />
      )}
      {selectedCollege && selectedCollege.country === "uk" && (
        <UKCollegeModal
          collegeId={selectedCollege.college.id}
          collegeName={
            (selectedCollege.college as UKCollegeData).universityName
          }
          onClose={() => setSelectedCollege(null)}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 px-6 py-8 bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <GraduationCap
                size={32}
                className="text-blue-600"
                weight="duotone"
              />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              No universities in your shortlist yet
            </h3>
            <p className="text-zinc-600 mb-6">
              Start building your shortlist by exploring universities or let our
              AI generate personalized recommendations based on your profile and
              goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/student/virtual-advisors/$advisor"
                params={{ advisor: "shortlister" }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-sm"
              >
                <Sparkle size={18} weight="fill" />
                Generate AI Recommendations
              </Link>
              <Link
                to="/student/universities/explorer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-all font-medium"
              >
                <Plus size={18} weight="bold" />
                Browse Universities
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Sparkle size={20} className="text-blue-600" weight="fill" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900 mb-1">
                  AI-Powered Recommendations
                </h4>
                <p className="text-sm text-zinc-600">
                  Get personalized university suggestions based on your academic
                  profile, preferences, and goals.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <ListChecks
                  size={20}
                  className="text-green-600"
                  weight="duotone"
                />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900 mb-1">
                  Smart Categorization
                </h4>
                <p className="text-sm text-zinc-600">
                  Universities automatically categorized as reach, target, or
                  safety based on your profile.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Plus size={20} className="text-purple-600" weight="bold" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900 mb-1">
                  Manual Selection
                </h4>
                <p className="text-sm text-zinc-600">
                  Add universities manually from our comprehensive database of
                  US and UK institutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CategorySectionProps {
  title: string;
  description: string;
  color: "purple" | "blue" | "green";
  universities: ShortlistedUniversity[];
  onRemove: (id: string) => void;
  onCollegeClick: (selection: {
    college: College | UKCollegeData;
    country: "us" | "uk";
  }) => void;
}

function CategorySection({
  title,
  description,
  color,
  universities,
  onRemove,
  onCollegeClick,
}: CategorySectionProps) {
  if (universities.length === 0) {
    return null;
  }

  const colorClasses = {
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium border",
            colorClasses[color],
          )}
        >
          {title}
        </div>
        <p className="text-sm text-zinc-500">{description}</p>
        <span className="ml-auto text-sm text-zinc-500">
          {universities.length} universit
          {universities.length === 1 ? "y" : "ies"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {universities.map((university) =>
          university.source === "manual" && university.rawCollege ? (
            <CollegeCard
              key={university.id}
              country={university.country}
              college={university.rawCollege as any}
              onClick={() =>
                onCollegeClick({
                  college: university.rawCollege as College | UKCollegeData,
                  country: university.country,
                })
              }
            />
          ) : (
            <UniversityCard
              key={university.id}
              university={university}
              onRemove={onRemove}
            />
          ),
        )}
      </div>
    </div>
  );
}

function UniversityCard({
  university,
  onRemove,
}: {
  university: ShortlistedUniversity;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all group">
      {/* Image/Gradient Header */}
      <div
        className={cn(
          "h-32 bg-gradient-to-br relative from-zinc-800 to-zinc-900",
        )}
      >
        {university.imageUrl ? (
          <img
            src={university.imageUrl}
            alt={university.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-4xl font-bold opacity-30">
              {university.name.charAt(0)}
            </div>
          </div>
        )}

        {university.source === "ai" && (
          <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            <Sparkle size={12} weight="fill" />
            AI Pick
          </div>
        )}

        {university.ranking && (
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
            <Star size={14} weight="fill" className="text-amber-500" />
            <span className="text-xs font-bold text-zinc-900">
              #{university.ranking}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-zinc-900 mb-1 group-hover:text-blue-600 transition-colors">
          {university.name}
        </h3>
        <div className="flex items-center gap-1 text-sm text-zinc-600 mb-3">
          <MapPin size={14} />
          {university.location}
        </div>

        {university.notes && (
          <p className="text-xs text-zinc-500 mb-3 line-clamp-2">
            {university.notes}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {university.acceptanceRate && (
            <div className="text-xs">
              <div className="text-zinc-500">Acceptance</div>
              <div className="font-semibold text-zinc-900">
                {university.acceptanceRate}
              </div>
            </div>
          )}
          {university.tuition && (
            <div className="text-xs">
              <div className="text-zinc-500">Tuition</div>
              <div className="font-semibold text-zinc-900">
                {university.tuition}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-zinc-100">
          {university.source === "ai" && university.virtualAdvisorSessionId && (
            <Link
              to="/student/virtual-advisors/$advisor"
              params={{ advisor: "shortlister" }}
              search={{
                sessionId: university.virtualAdvisorSessionId,
              }}
              className="flex-1 text-sm px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ChatCircle size={14} weight="fill" />
              View Chat
            </Link>
          )}
          <button
            onClick={() => onRemove(university.id)}
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
          >
            <Trash size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
