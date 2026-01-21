import { College } from "../types";
import { CollapsibleSection, StatCard } from "../components";

export function AdmissionsTab({ college }: { college: College }) {
  const admissionRate = college.admissionRate
    ? (college.admissionRate * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Admission Statistics */}
      <CollapsibleSection title="Admission Statistics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {admissionRate && (
            <StatCard label="Admission Rate" value={`${admissionRate}%`} />
          )}
        </div>
      </CollapsibleSection>

      {/* Test Scores */}
      <CollapsibleSection title="Test Scores">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {college.satScoreAverage && (
            <StatCard
              label="Average SAT Score"
              value={college.satScoreAverage.toLocaleString()}
            />
          )}
          {college.mathSatRange && (
            <StatCard label="Math SAT Range" value={college.mathSatRange} />
          )}
          {college.readingSatRange && (
            <StatCard label="Reading SAT Range" value={college.readingSatRange} />
          )}
          {college.actScoreMidpoint && (
            <StatCard
              label="ACT Score Midpoint"
              value={college.actScoreMidpoint}
            />
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}
