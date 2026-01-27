import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import type { AptitudeTestSession } from "@student/db/src/schema/aptitude";

const COMFORT_CATEGORIES = [
  {
    id: "mathematics",
    label: "Mathematics",
    description: "Numbers, calculations, algebra, geometry",
  },
  {
    id: "sciences",
    label: "Sciences",
    description: "Physics, chemistry, biology, experiments",
  },
  {
    id: "humanities",
    label: "Humanities",
    description: "History, philosophy, literature, social studies",
  },
  {
    id: "languages",
    label: "Languages",
    description: "English, foreign languages, communication",
  },
  {
    id: "arts",
    label: "Arts",
    description: "Visual arts, music, creative expression",
  },
];

const COMFORT_LEVELS = [
  { value: 1, label: "Very Uncomfortable" },
  { value: 2, label: "Uncomfortable" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Comfortable" },
  { value: 5, label: "Very Comfortable" },
];

type SubjectComfortStepProps = {
  session: AptitudeTestSession;
  updateSession: (data: {
    subjectComfortLevels?: Record<string, number>;
  }) => Promise<unknown>;
  onNext: () => void;
  onPrevious: () => void;
  readOnly?: boolean;
};

export function SubjectComfortStep({
  session,
  updateSession,
  onNext,
  onPrevious,
  readOnly = false,
}: SubjectComfortStepProps) {
  const [comfortLevels, setComfortLevels] = useState<Record<string, number>>(
    session.subjectComfortLevels || {}
  );
  const [isSaving, setIsSaving] = useState(false);

  // Sync with session data
  useEffect(() => {
    setComfortLevels(session.subjectComfortLevels || {});
  }, [session.subjectComfortLevels]);

  const setLevel = (categoryId: string, level: number) => {
    if (readOnly) return;
    setComfortLevels((prev) => ({
      ...prev,
      [categoryId]: level,
    }));
  };

  const allCategoriesRated = COMFORT_CATEGORIES.every(
    (cat) => comfortLevels[cat.id] !== undefined
  );

  const handleNext = async () => {
    if (!allCategoriesRated) return;

    setIsSaving(true);
    try {
      await updateSession({
        subjectComfortLevels: comfortLevels,
      });
      onNext();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
          Rate Your Comfort Level
        </h2>
        <p className="text-zinc-600">
          How comfortable are you with each subject area?
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {COMFORT_CATEGORIES.map((category) => {
          const currentLevel = comfortLevels[category.id];

          return (
            <div
              key={category.id}
              className="bg-white rounded-lg border border-zinc-200 p-4"
            >
              <div className="mb-3">
                <h3 className="font-medium text-zinc-900">{category.label}</h3>
                <p className="text-sm text-zinc-500">{category.description}</p>
              </div>

              <div className="flex gap-2">
                {COMFORT_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setLevel(category.id, level.value)}
                    disabled={readOnly}
                    className={cn(
                      "flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all border-2",
                      currentLevel === level.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300",
                      readOnly && "cursor-default"
                    )}
                    title={level.label}
                  >
                    {level.value}
                  </button>
                ))}
              </div>
              {currentLevel && (
                <p className="text-xs text-zinc-500 mt-2 text-center">
                  {COMFORT_LEVELS.find((l) => l.value === currentLevel)?.label}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          disabled={readOnly}
          className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </button>

        {!readOnly && (
          <button
            onClick={handleNext}
            disabled={!allCategoriesRated || isSaving}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all",
              allCategoriesRated
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-zinc-200 text-zinc-500 cursor-not-allowed"
            )}
          >
            {isSaving ? "Saving..." : "Continue"}
            <ArrowRightIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
