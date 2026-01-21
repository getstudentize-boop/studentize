import { College } from "../types";
import { CollapsibleSection, StatCard } from "../components";

type ImportanceLevel = "Very Important" | "Important" | "Considered";

function ImportanceBadge({ level }: { level: ImportanceLevel }) {
  const styles: Record<ImportanceLevel, string> = {
    "Very Important": "bg-pink-100 text-pink-600 border-pink-200",
    Important: "bg-blue-100 text-blue-600 border-blue-200",
    Considered: "bg-emerald-100 text-emerald-600 border-emerald-200",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-md border ${styles[level]}`}
    >
      {level}
    </span>
  );
}

function FactorCard({
  label,
  importance,
}: {
  label: string;
  importance: ImportanceLevel;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border border-zinc-200 rounded-lg bg-white">
      <span className="text-sm text-zinc-700">{label}</span>
      <ImportanceBadge level={importance} />
    </div>
  );
}

function FactorGroup({
  title,
  factors,
}: {
  title: string;
  factors: { label: string; importance: ImportanceLevel }[];
}) {
  return (
    <div className="border border-zinc-200 rounded-lg p-4">
      <h4 className="font-semibold text-zinc-900 mb-4">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {factors.map((factor) => (
          <FactorCard
            key={factor.label}
            label={factor.label}
            importance={factor.importance}
          />
        ))}
      </div>
    </div>
  );
}

// Helper to parse admissions factors from college data
function parseAdmissionsFactors(factors: Record<string, string> | null) {
  if (!factors) return null;

  const academicKeys = [
    "Academic GPA",
    "Standardized Test Scores",
    "Rigor of Secondary School Record",
  ];
  const personalKeys = [
    "Character/Personal Qualities",
    "Talent/Ability",
    "Interview",
  ];
  const activitiesKeys = [
    "Extracurricular Activities",
    "Volunteer Work",
    "Work Experience",
  ];
  const materialsKeys = ["Application Essay", "Recommendation(s)"];
  const backgroundKeys = [
    "First Generation",
    "Racial/Ethnic Status",
    "State Residency",
    "Geographical Residence",
    "Alumni/ae Relations",
  ];

  const mapToFactors = (keys: string[]) =>
    keys
      .filter((key) => factors[key])
      .map((key) => ({
        label: key,
        importance: factors[key] as ImportanceLevel,
      }));

  return {
    academic: mapToFactors(academicKeys),
    personalQualities: mapToFactors(personalKeys),
    activitiesExperience: mapToFactors(activitiesKeys),
    applicationMaterials: mapToFactors(materialsKeys),
    background: mapToFactors(backgroundKeys),
  };
}

export function AcademicsTab({ college }: { college: College }) {
  const graduationRate = college.graduationRate
    ? college.graduationRate.toFixed(1)
    : null;
  const retentionRate = college.retentionRate
    ? college.retentionRate.toFixed(1)
    : null;
  const firstGenStudents = college.shareFirstGeneration
    ? college.shareFirstGeneration.toFixed(1)
    : null;

  const parsedFactors = parseAdmissionsFactors(college.admissionsFactors);

  return (
    <div className="space-y-6">
      {/* Academic Performance */}
      <CollapsibleSection title="Academic Performance">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {graduationRate && (
            <StatCard label="Graduation Rate" value={`${graduationRate}%`} />
          )}
          {retentionRate && (
            <StatCard label="Retention Rate" value={`${retentionRate}%`} />
          )}
        </div>
      </CollapsibleSection>

      {/* Career Outcomes */}
      {college.postGradEarnings && (
        <CollapsibleSection title="Career Outcomes">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Post-Graduation Earnings"
              value={`$${college.postGradEarnings.toLocaleString()}/year`}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* Student Demographics */}
      <CollapsibleSection title="Student Demographics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {firstGenStudents && (
            <StatCard
              label="First Generation Students"
              value={`${firstGenStudents}%`}
            />
          )}
          {college.actScoreMidpoint && (
            <StatCard
              label="ACT Score Midpoint"
              value={college.actScoreMidpoint}
            />
          )}
        </div>
      </CollapsibleSection>

      {/* Admissions Factors */}
      {parsedFactors && (
        <CollapsibleSection title="Admissions Factors">
          <div className="space-y-4">
            {parsedFactors.academic.length > 0 && (
              <FactorGroup title="Academic" factors={parsedFactors.academic} />
            )}
            {parsedFactors.personalQualities.length > 0 && (
              <FactorGroup
                title="Personal Qualities"
                factors={parsedFactors.personalQualities}
              />
            )}
            {parsedFactors.activitiesExperience.length > 0 && (
              <FactorGroup
                title="Activities & Experience"
                factors={parsedFactors.activitiesExperience}
              />
            )}
            {parsedFactors.applicationMaterials.length > 0 && (
              <FactorGroup
                title="Application Materials"
                factors={parsedFactors.applicationMaterials}
              />
            )}
            {parsedFactors.background.length > 0 && (
              <FactorGroup title="Background" factors={parsedFactors.background} />
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
