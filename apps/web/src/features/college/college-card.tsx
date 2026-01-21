import { MapPin } from "@phosphor-icons/react";
import { College } from "./types";

// Determine selectivity color based on admission rate
const getSelectivityColor = (rate: number) => {
  if (rate < 0.15) return "bg-blue-500";
  if (rate < 0.3) return "bg-blue-400";
  if (rate < 0.5) return "bg-blue-300";
  return "bg-blue-200";
};

export function CollegeCard({
  college,
  onClick,
}: {
  college: College;
  onClick: () => void;
}) {
  const name = college.schoolName;
  const location =
    college.schoolCity && college.schoolState
      ? `${college.schoolCity}, ${college.schoolState}`
      : college.schoolState || college.schoolCity || "—";

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg border border-zinc-200 p-4 hover:border-blue-200 hover:shadow-md transition-all group"
    >
      <img
        src={college.imageUrl ?? ""}
        className="w-full h-40 mb-2 rounded-lg object-cover bg-zinc-50"
      />
      <div className="flex items-start gap-3">
        {college.admissionRate && (
          <div
            className={`w-1 h-12 rounded-full ${getSelectivityColor(college.admissionRate)} flex-shrink-0`}
          />
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
        {college.tuitionOutOfState && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Tuition</span>
            <span className="font-medium text-zinc-900">
              ${Number(college.tuitionOutOfState).toLocaleString()}
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
        {college.satScoreAverage && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Avg SAT</span>
            <span className="font-medium text-zinc-900">
              {college.satScoreAverage}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
