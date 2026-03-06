import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  GraduationCap,
  X,
  CurrencyDollar,
  Users,
  House,
  AddressBook,
  Globe,
  Spinner,
  Bus,
  Briefcase,
  Student,
  Buildings,
  Bed,
} from "@phosphor-icons/react";
import { orpc } from "orpc/client";
import { Markdown } from "@/components/markdown";
import type { UKCollegeData } from "./types";

const UK_MODAL_TABS = [
  { id: "overview", label: "Overview", icon: House },
  { id: "admissions", label: "Admissions", icon: GraduationCap },
  { id: "finances", label: "Finances", icon: CurrencyDollar },
  { id: "campus-life", label: "Campus Life", icon: Users },
  { id: "contact", label: "Contact", icon: AddressBook },
] as const;

type UKModalTab = (typeof UK_MODAL_TABS)[number]["id"];

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="py-2 border-b border-zinc-100 last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <p className="text-sm font-medium text-zinc-900 mt-0.5">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-sm font-semibold text-zinc-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

/** Try to parse a value as JSON. Returns the parsed object or null. */
function tryParseJson(value: string | null | undefined): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Renders a JSON object as nested key-value cards */
function JsonDisplay({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (data === null || data === undefined) return null;

  if (Array.isArray(data)) {
    return (
      <ul className="list-disc list-inside space-y-0.5">
        {data.map((item, i) => (
          <li key={i} className="text-sm text-zinc-600">
            {typeof item === "object" ? (
              <JsonDisplay data={item} depth={depth + 1} />
            ) : (
              String(item)
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    if (depth === 0) {
      return (
        <div className="grid gap-3">
          {entries.map(([key, val]) => (
            <div key={key} className="bg-zinc-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                {formatKey(key)}
              </p>
              {typeof val === "object" && val !== null ? (
                <JsonDisplay data={val} depth={depth + 1} />
              ) : (
                <p className="text-sm text-zinc-700">{String(val ?? "—")}</p>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-1 mt-1">
        {entries.map(([key, val]) => (
          <div key={key} className="flex gap-2">
            <span className="text-xs font-medium text-zinc-500 min-w-[100px] shrink-0">
              {formatKey(key)}:
            </span>
            <span className="text-sm text-zinc-700">
              {typeof val === "object" && val !== null ? (
                <JsonDisplay data={val} depth={depth + 1} />
              ) : (
                String(val ?? "—")
              )}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-sm text-zinc-600">{String(data)}</span>;
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Renders content that might be JSON or plain text/markdown */
function SmartContent({ value }: { value: string | null | undefined }) {
  if (!value) return null;

  const parsed = tryParseJson(value);
  if (parsed) {
    return <JsonDisplay data={parsed} />;
  }

  return <Markdown className="text-sm text-zinc-600">{value}</Markdown>;
}

/** Render student composition by subject as a horizontal bar chart */
function SubjectComposition({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
  const max = entries[0]?.[1] ?? 1;

  return (
    <div className="space-y-2">
      {entries.slice(0, 12).map(([subject, count]) => (
        <div key={subject} className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 w-[140px] shrink-0 text-right truncate">
            {subject}
          </span>
          <div className="flex-1 bg-zinc-100 rounded-full h-5 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-zinc-600 w-[50px]">
            {count.toLocaleString()}
          </span>
        </div>
      ))}
      {entries.length > 12 && (
        <p className="text-xs text-zinc-400 text-center pt-1">
          +{entries.length - 12} more subjects
        </p>
      )}
    </div>
  );
}

/** Render student life info JSON as cards with icons */
function StudentLifeDisplay({ data }: { data: Record<string, unknown> }) {
  const iconMap: Record<string, React.ReactNode> = {
    "Student Jobs": <Briefcase size={16} className="text-blue-500" />,
    Transportation: <Bus size={16} className="text-green-500" />,
    "Students Union": <Student size={16} className="text-purple-500" />,
    "Campus Facilities": <Buildings size={16} className="text-orange-500" />,
    Accommodation: <Bed size={16} className="text-teal-500" />,
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.entries(data).map(([key, val]) => (
        <div key={key} className="bg-zinc-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {iconMap[key] ?? <Users size={16} className="text-zinc-400" />}
            <h4 className="text-sm font-semibold text-zinc-800">
              {formatKey(key)}
            </h4>
          </div>
          {typeof val === "object" && val !== null ? (
            <JsonDisplay data={val} depth={1} />
          ) : (
            <p className="text-sm text-zinc-600">{String(val)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function OverviewTab({ college }: { college: UKCollegeData }) {
  const studentLifeData = tryParseJson(college.studentLifeInfo);
  const compositionData = tryParseJson(college.studentComposition);
  const bySubject =
    compositionData &&
    "by_subject" in compositionData &&
    typeof compositionData.by_subject === "object"
      ? (compositionData.by_subject as Record<string, number>)
      : null;

  return (
    <div className="space-y-6">
      {college.about && (
        <Section title="About">
          <Markdown className="text-sm text-zinc-600">{college.about}</Markdown>
        </Section>
      )}
      <Section title="Quick Facts">
        <div className="bg-zinc-50 rounded-lg p-4">
          <InfoRow label="Location" value={college.location} />
          <InfoRow
            label="Year Established"
            value={college.yearOfEstablishment}
          />
          <InfoRow label="City Size" value={college.sizeOfCity} />
          <InfoRow label="City Population" value={college.populationOfCity} />
          <InfoRow label="Number of Campuses" value={college.numberOfCampuses} />
          <InfoRow
            label="International Students"
            value={
              college.totalForeignStudents
                ? Number(college.totalForeignStudents).toLocaleString()
                : null
            }
          />
        </div>
      </Section>
      {studentLifeData && (
        <Section title="Student Life">
          <StudentLifeDisplay data={studentLifeData} />
        </Section>
      )}
      {!studentLifeData && college.studentLifeInfo && (
        <Section title="Student Life">
          <Markdown className="text-sm text-zinc-600">
            {college.studentLifeInfo}
          </Markdown>
        </Section>
      )}
      {bySubject && (
        <Section title="Students by Subject">
          <SubjectComposition data={bySubject} />
        </Section>
      )}
    </div>
  );
}

function AdmissionsTab({ college }: { college: UKCollegeData }) {
  return (
    <div className="space-y-6">
      <Section title="Requirements">
        <div className="bg-zinc-50 rounded-lg p-4">
          <InfoRow label="Exams Accepted" value={college.examsAccepted} />
        </div>
      </Section>
      {college.academicRequirements && (
        <Section title="Academic Requirements">
          <SmartContent value={college.academicRequirements} />
        </Section>
      )}
    </div>
  );
}

function FinancesTab({ college }: { college: UKCollegeData }) {
  return (
    <div className="space-y-6">
      <Section title="Costs">
        <div className="bg-zinc-50 rounded-lg p-4">
          <InfoRow
            label="International Tuition"
            value={
              college.tuitionFees
                ? `£${Number(college.tuitionFees).toLocaleString()}`
                : null
            }
          />
        </div>
      </Section>
      {college.scholarships && (
        <Section title="Scholarships">
          <SmartContent value={college.scholarships} />
        </Section>
      )}
    </div>
  );
}

function CampusLifeTab({ college }: { college: UKCollegeData }) {
  return (
    <div className="space-y-6">
      {college.onCampusAccommodation && (
        <Section title="On-Campus Accommodation">
          <SmartContent value={college.onCampusAccommodation} />
        </Section>
      )}
      {college.offCampusAccommodation && (
        <Section title="Off-Campus Accommodation">
          <SmartContent value={college.offCampusAccommodation} />
        </Section>
      )}
    </div>
  );
}

function ContactTab({ college }: { college: UKCollegeData }) {
  return (
    <div className="space-y-6">
      <Section title="Contact Information">
        <div className="bg-zinc-50 rounded-lg p-4">
          <InfoRow label="Address" value={college.address} />
          <InfoRow label="Phone" value={college.phone} />
          <InfoRow
            label="International Email"
            value={college.internationalEmail}
          />
          {college.website && (
            <div className="flex justify-between py-2 border-b border-zinc-100 last:border-0">
              <span className="text-sm text-zinc-500">Website</span>
              <a
                href={
                  college.website.startsWith("http")
                    ? college.website
                    : `https://${college.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
              >
                <Globe size={14} />
                Visit Website
              </a>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

export function UKCollegeModal({
  collegeId,
  collegeName,
  onClose,
}: {
  collegeId: string;
  collegeName: string;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<UKModalTab>("overview");

  const { data: college, isLoading } = useQuery(
    orpc.college.getUK.queryOptions({
      input: { id: collegeId },
    }),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors"
        >
          <X size={18} className="text-zinc-600" />
        </button>

        <div className="overflow-y-auto max-h-[85vh] custom-scrollbar">
          {/* Header */}
          <div className="p-6 border-b border-zinc-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 pr-8">
                  {college?.universityName ?? collegeName}
                </h2>
                {college?.location && (
                  <div className="flex items-center gap-1.5 text-zinc-500 text-sm mt-1">
                    <MapPin size={14} />
                    <span>{college.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-zinc-200 sticky top-0 bg-white z-10">
            <div className="flex px-6 gap-1 overflow-x-auto no-scrollbar">
              {UK_MODAL_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Spinner size={32} className="animate-spin text-blue-500" />
                <p className="text-sm text-zinc-500">
                  Loading university details...
                </p>
              </div>
            ) : college ? (
              <>
                {activeTab === "overview" && (
                  <OverviewTab college={college as UKCollegeData} />
                )}
                {activeTab === "admissions" && (
                  <AdmissionsTab college={college as UKCollegeData} />
                )}
                {activeTab === "finances" && (
                  <FinancesTab college={college as UKCollegeData} />
                )}
                {activeTab === "campus-life" && (
                  <CampusLifeTab college={college as UKCollegeData} />
                )}
                {activeTab === "contact" && (
                  <ContactTab college={college as UKCollegeData} />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-sm text-zinc-500">
                  Failed to load university details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
