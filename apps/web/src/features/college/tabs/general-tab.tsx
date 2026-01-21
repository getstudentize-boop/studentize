import {
  GlobeHemisphereWest,
  Buildings,
  CurrencyDollar,
  ChartLine,
  Users,
  GraduationCap,
} from "@phosphor-icons/react";
import { College } from "../types";

export function GeneralTab({ college }: { college: College }) {
  return (
    <div className="space-y-6">
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
        {college.tuitionOutOfState && (
          <div className="p-3 border border-zinc-200 rounded-lg">
            <div className="flex items-center gap-1 text-zinc-400 mb-1">
              <CurrencyDollar size={14} />
              <span className="text-xs">Tuition</span>
            </div>
            <div className="text-base font-semibold text-zinc-900">
              ${Number(college.tuitionOutOfState).toLocaleString()}
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
      {(college.satScoreAverage ||
        college.retentionRate ||
        college.postGradEarnings) && (
        <div className="p-4 bg-zinc-50 rounded-lg">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
            Academic Metrics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {college.satScoreAverage && (
              <div>
                <div className="text-xs text-zinc-500 mb-0.5">Avg SAT</div>
                <div className="text-lg font-semibold text-zinc-900">
                  {college.satScoreAverage}
                </div>
              </div>
            )}
            {college.retentionRate && (
              <div>
                <div className="text-xs text-zinc-500 mb-0.5">Retention</div>
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
  );
}
