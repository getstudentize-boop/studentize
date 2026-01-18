import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap,
  Sparkle,
  Plus,
  MapPin,
  Star,
  Trash,
  ArrowRight,
  ChartLine,
  Users,
  CurrencyDollar,
  BookmarkSimple,
  ListChecks
} from "@phosphor-icons/react";
import { cn } from "@/utils/cn";

export const Route = createFileRoute("/_authenticated/student/universities/shortlist")({
  component: ShortlistPage,
});

type ShortlistCategory = "reach" | "target" | "safety";

interface ShortlistedUniversity {
  id: string;
  name: string;
  location: string;
  imageUrl?: string;
  ranking?: string;
  acceptanceRate?: string;
  tuition?: string;
  category?: ShortlistCategory;
  isAiRecommended?: boolean;
}

function ShortlistPage() {
  // TODO: Replace with actual API data
  const [hasAiRecommendations] = useState(false);
  const [hasManualShortlist] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "ai" | "manual">("all");

  // Mock data for demonstration (will be replaced with API)
  const aiRecommendations: ShortlistedUniversity[] = [];
  const manualShortlist: ShortlistedUniversity[] = [];

  const isEmpty = !hasAiRecommendations && !hasManualShortlist;

  if (isEmpty) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 px-6 py-8 bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        {/* Header with Actions */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">Your University Shortlist</h2>
            <p className="text-sm text-zinc-500 mt-1">
              {(aiRecommendations.length + manualShortlist.length)} universities in your shortlist
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
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-sm">
              <Sparkle size={18} weight="fill" />
              Generate AI Shortlist
            </button>
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
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            All Universities
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
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Sparkle size={16} weight="fill" />
            AI Recommendations
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
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            <BookmarkSimple size={16} weight="fill" />
            My Picks
            {activeTab === "manual" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Category Sections */}
        <div className="space-y-8">
          {/* Reach Schools */}
          <CategorySection
            title="Reach Schools"
            description="Highly competitive schools where admission is challenging"
            color="purple"
            universities={[]} // Filter by category
          />

          {/* Target Schools */}
          <CategorySection
            title="Target Schools"
            description="Schools where your profile aligns well with admitted students"
            color="blue"
            universities={[]} // Filter by category
          />

          {/* Safety Schools */}
          <CategorySection
            title="Safety Schools"
            description="Schools where you have a strong chance of admission"
            color="green"
            universities={[]} // Filter by category
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 px-6 py-8 bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        {/* Empty State */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <GraduationCap size={32} className="text-blue-600" weight="duotone" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              No universities in your shortlist yet
            </h3>
            <p className="text-zinc-600 mb-6">
              Start building your shortlist by exploring universities or let our AI generate
              personalized recommendations based on your profile and goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-sm">
                <Sparkle size={18} weight="fill" />
                Generate AI Recommendations
              </button>
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
                <h4 className="font-semibold text-zinc-900 mb-1">AI-Powered Recommendations</h4>
                <p className="text-sm text-zinc-600">
                  Get personalized university suggestions based on your academic profile, preferences, and goals.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <ListChecks size={20} className="text-green-600" weight="duotone" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900 mb-1">Smart Categorization</h4>
                <p className="text-sm text-zinc-600">
                  Universities automatically categorized as reach, target, or safety based on your profile.
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
                <h4 className="font-semibold text-zinc-900 mb-1">Manual Selection</h4>
                <p className="text-sm text-zinc-600">
                  Add universities manually from our comprehensive database of US and UK institutions.
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
}

function CategorySection({ title, description, color, universities }: CategorySectionProps) {
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
        <div className={cn("px-3 py-1 rounded-full text-sm font-medium border", colorClasses[color])}>
          {title}
        </div>
        <p className="text-sm text-zinc-500">{description}</p>
        <span className="ml-auto text-sm text-zinc-500">{universities.length} universities</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {universities.map((university) => (
          <UniversityCard key={university.id} university={university} />
        ))}
      </div>
    </div>
  );
}

interface UniversityCardProps {
  university: ShortlistedUniversity;
}

function UniversityCard({ university }: UniversityCardProps) {
  const colors = [
    ['from-blue-500', 'to-blue-600'],
    ['from-purple-500', 'to-purple-600'],
    ['from-indigo-500', 'to-indigo-600'],
  ];
  const colorIndex = university.name.length % colors.length;
  const [fromColor, toColor] = colors[colorIndex];

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all group">
      {/* Image/Gradient Header */}
      <div className={cn("h-32 bg-gradient-to-br relative", fromColor, toColor)}>
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

        {university.isAiRecommended && (
          <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            <Sparkle size={12} weight="fill" />
            AI Pick
          </div>
        )}

        {university.ranking && (
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
            <Star size={14} weight="fill" className="text-amber-500" />
            <span className="text-xs font-bold text-zinc-900">#{university.ranking}</span>
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {university.acceptanceRate && (
            <div className="text-xs">
              <div className="text-zinc-500">Acceptance</div>
              <div className="font-semibold text-zinc-900">{university.acceptanceRate}</div>
            </div>
          )}
          {university.tuition && (
            <div className="text-xs">
              <div className="text-zinc-500">Tuition</div>
              <div className="font-semibold text-zinc-900">{university.tuition}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-zinc-100">
          <button className="flex-1 text-sm px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2">
            View Details
            <ArrowRight size={14} />
          </button>
          <button className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
