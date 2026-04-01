import { cn } from "@/utils/cn";
import {
  WizardData,
  CAMPUS_OPTIONS,
  CLASS_SIZE_OPTIONS,
  COUNTRY_OPTIONS,
} from "./types";
import {
  BuildingsIcon,
  UsersIcon,
  GlobeIcon,
} from "@phosphor-icons/react";

interface StepPreferencesProps {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
}

export function StepPreferences({ data, onChange }: StepPreferencesProps) {
  const toggleCountry = (country: string) => {
    const current = data.targetCountries;
    if (current.includes(country)) {
      onChange({ targetCountries: current.filter((c) => c !== country) });
    } else {
      onChange({ targetCountries: [...current, country] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Countries */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <GlobeIcon size={18} className="text-zinc-600" />
          <label className="block text-sm font-medium text-zinc-900">
            Where do you want to study?
          </label>
        </div>
        <div className="flex gap-3">
          {COUNTRY_OPTIONS.map((country) => (
            <button
              key={country.value}
              type="button"
              onClick={() => toggleCountry(country.value)}
              className={cn(
                "flex-1 px-4 py-3 rounded-lg border transition-all text-center",
                data.targetCountries.includes(country.value)
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-zinc-200 hover:border-zinc-300 text-zinc-700"
              )}
            >
              <div className="font-medium">{country.label}</div>
            </button>
          ))}
        </div>
        {data.targetCountries.length === 0 && (
          <p className="text-xs text-amber-600 mt-2">
            Please select at least one country
          </p>
        )}
      </div>

      {/* Campus Preference */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BuildingsIcon size={18} className="text-zinc-600" />
          <label className="block text-sm font-medium text-zinc-900">
            Campus preference
          </label>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {CAMPUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ campusPreference: option.value })}
              className={cn(
                "px-4 py-3 rounded-lg border transition-all text-left",
                data.campusPreference === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              <div
                className={cn(
                  "font-medium text-sm",
                  data.campusPreference === option.value
                    ? "text-blue-900"
                    : "text-zinc-900"
                )}
              >
                {option.label}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Class Size Preference */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <UsersIcon size={18} className="text-zinc-600" />
          <label className="block text-sm font-medium text-zinc-900">
            Class size preference
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CLASS_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ classSizePreference: option.value })}
              className={cn(
                "px-4 py-3 rounded-lg border transition-all text-left",
                data.classSizePreference === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              <div
                className={cn(
                  "font-medium text-sm",
                  data.classSizePreference === option.value
                    ? "text-blue-900"
                    : "text-zinc-900"
                )}
              >
                {option.label}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
