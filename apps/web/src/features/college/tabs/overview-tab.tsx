import { GenderMale, GenderFemale } from "@phosphor-icons/react";
import { College } from "../types";
import { CollapsibleSection, ProgressBar, StatCard } from "../components";

export function OverviewTab({ college }: { college: College }) {
  // Parse diversity data from ugRaceJson
  const diversity = college.ugRaceJson
    ? Object.entries(college.ugRaceJson)
        .filter(
          ([key]) => key !== "total_students" && key !== "race_distribution"
        )
        .map(([key, value]) => {
          // Handle nested race_distribution object
          if (key === "race_distribution" && typeof value === "object") {
            return Object.entries(value as Record<string, string>).map(
              ([raceKey, raceValue]) => ({
                label: raceKey,
                value: parseFloat(String(raceValue).replace("%", "")) || 0,
              })
            );
          }
          return {
            label: key,
            value: parseFloat(String(value).replace("%", "")) || 0,
          };
        })
        .flat()
        .filter((item) => typeof item === "object" && "label" in item)
    : null;

  // Parse residence data from ugStudentResidenceJson
  const residence = college.ugStudentResidenceJson
    ? Object.entries(college.ugStudentResidenceJson).map(([key, value]) => ({
        label: key,
        value: parseFloat(String(value).replace("%", "")) || 0,
      }))
    : null;

  // Parse age distribution from ugAgeDistributionJson
  const ageDistribution = college.ugAgeDistributionJson
    ? Object.entries(college.ugAgeDistributionJson).map(([key, value]) => ({
        label: key,
        value: parseFloat(String(value).replace("%", "")) || 0,
      }))
    : null;

  // Calculate gender percentages
  const malePercentage = college.maleShare
    ? (college.maleShare * 100).toFixed(1)
    : null;
  const femalePercentage = college.femaleShare
    ? (college.femaleShare * 100).toFixed(1)
    : null;

  // Get the about text from real data
  const aboutText = college.aboutSection || null;

  // Get environment text from real data
  const environmentText = college.environment || null;

  return (
    <div className="space-y-6">
      {/* About Section */}
      {aboutText && (
        <div>
          <h3 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
            About {college.schoolName}
          </h3>
          <div className="p-4 border border-zinc-200 rounded-lg">
            <p className="text-zinc-600 leading-relaxed">{aboutText}</p>
          </div>
        </div>
      )}

      {/* Campus Information */}
      <CollapsibleSection title="Campus Information">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {college.campusSetting && (
            <StatCard label="Campus Setting" value={college.campusSetting} />
          )}
          {college.yearOfEstablishment && (
            <StatCard
              label="Year Established"
              value={college.yearOfEstablishment}
            />
          )}
          {college.noOfCampus && (
            <StatCard label="Number of Campuses" value={college.noOfCampus} />
          )}
          {college.graduationRate && (
            <StatCard
              label="Graduation Rate"
              value={`${(college.graduationRate * 100).toFixed(1)}%`}
            />
          )}
        </div>
      </CollapsibleSection>

      {/* Student Body */}
      {(college.totalEnrollment ||
        college.undergraduateEnrollment ||
        college.graduateEnrollment ||
        college.studentSize) && (
        <CollapsibleSection title="Student Body">
          <div className="p-4 border border-zinc-200 rounded-lg space-y-4">
            <div className="space-y-3">
              {(college.undergraduateEnrollment || college.studentSize) && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-600 w-28">
                    Undergraduate
                  </span>
                  <div className="flex-1 relative h-8 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-end pr-3"
                      style={{ width: "100%" }}
                    >
                      <span className="text-white text-sm font-medium">
                        {(
                          college.undergraduateEnrollment || college.studentSize
                        )?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-600 w-28">Graduate</span>
                <div className="flex-1 relative h-8 bg-zinc-100 rounded-full overflow-hidden">
                  {college.graduateEnrollment ? (
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-600 to-teal-400 rounded-full flex items-center justify-end pr-3"
                      style={{ width: "100%" }}
                    >
                      <span className="text-white text-sm font-medium">
                        {college.graduateEnrollment.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-teal-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      N/A
                    </div>
                  )}
                </div>
              </div>
            </div>
            {college.totalEnrollment && (
              <div className="border-t border-dashed border-zinc-200 pt-4 text-center">
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Total Students
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {college.totalEnrollment.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Gender Distribution */}
      {malePercentage && femalePercentage && (
        <CollapsibleSection title="Gender Distribution">
          <div className="space-y-3">
            <div className="relative h-12 bg-zinc-100 rounded-full overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-blue-700 to-blue-500 flex items-center justify-center gap-2"
                style={{ width: `${malePercentage}%` }}
              >
                <GenderMale size={18} className="text-white" weight="bold" />
                <span className="text-white text-sm font-medium">
                  {malePercentage}%
                </span>
              </div>
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-300 flex items-center justify-center gap-2"
                style={{ width: `${femalePercentage}%` }}
              >
                <GenderFemale size={18} className="text-white" weight="bold" />
                <span className="text-white text-sm font-medium">
                  {femalePercentage}%
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Male
              </span>
              <span className="text-sm text-blue-400 bg-blue-50 px-3 py-1 rounded-full">
                Female
              </span>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Student Demographics */}
      {(diversity || residence || ageDistribution) && (
        <CollapsibleSection title="Student Demographics">
          <div className="space-y-6">
            {/* Undergraduate Student Diversity */}
            {diversity && diversity.length > 0 && (
              <div>
                <h4 className="font-semibold text-zinc-900 mb-4">
                  Undergraduate Student Diversity
                </h4>
                <div className="p-4 border border-zinc-200 rounded-lg space-y-4">
                  {diversity.map((item, index) => {
                    const colors = [
                      "bg-red-400",
                      "bg-yellow-400",
                      "bg-green-500",
                      "bg-cyan-400",
                      "bg-blue-500",
                      "bg-purple-400",
                      "bg-pink-400",
                      "bg-orange-400",
                    ];
                    return (
                      <ProgressBar
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        color={colors[index % colors.length]}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Student Residence */}
            {residence && residence.length > 0 && (
              <div>
                <h4 className="font-semibold text-zinc-900 mb-4">
                  Student Residence
                </h4>
                <div className="p-4 border border-zinc-200 rounded-lg space-y-4">
                  {residence.map((item, index) => {
                    const colors = [
                      "bg-red-400",
                      "bg-yellow-400",
                      "bg-green-500",
                    ];
                    return (
                      <ProgressBar
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        color={colors[index % colors.length]}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Age Distribution */}
            {ageDistribution && ageDistribution.length > 0 && (
              <div>
                <h4 className="font-semibold text-zinc-900 mb-4">
                  Age Distribution
                </h4>
                <div className="p-4 border border-zinc-200 rounded-lg space-y-4">
                  {ageDistribution.map((item, index) => {
                    const colors = ["bg-blue-500", "bg-blue-400"];
                    return (
                      <ProgressBar
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        color={colors[index % colors.length]}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Campus Environment */}
      {environmentText && (
        <CollapsibleSection title="Campus Environment">
          <div className="p-4 border border-zinc-200 rounded-lg">
            <p className="text-zinc-600 leading-relaxed">{environmentText}</p>
          </div>
        </CollapsibleSection>
      )}

      {/* Campus Services */}
      <CollapsibleSection title="Campus Services" defaultOpen={false}>
        <div className="text-center py-8 text-zinc-500">
          <p className="text-sm">Campus services information coming soon</p>
        </div>
      </CollapsibleSection>
    </div>
  );
}
