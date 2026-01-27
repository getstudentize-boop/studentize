import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { CheckIcon, ArrowRightIcon } from "@phosphor-icons/react";
import type { AptitudeTestSession } from "@student/db/src/schema/aptitude";

const AVAILABLE_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "History",
  "Geography",
  "Economics",
  "Business Studies",
  "Art & Design",
  "Music",
  "Psychology",
  "Sociology",
  "Political Science",
  "Philosophy",
  "Foreign Languages",
  "Physical Education",
];

type FavoriteSubjectsStepProps = {
  session: AptitudeTestSession;
  updateSession: (data: { favoriteSubjects?: string[] }) => Promise<unknown>;
  onNext: () => void;
  readOnly?: boolean;
};

export function FavoriteSubjectsStep({
  session,
  updateSession,
  onNext,
  readOnly = false,
}: FavoriteSubjectsStepProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    session.favoriteSubjects || []
  );
  const [isSaving, setIsSaving] = useState(false);

  // Sync with session data
  useEffect(() => {
    setSelectedSubjects(session.favoriteSubjects || []);
  }, [session.favoriteSubjects]);

  const toggleSubject = (subject: string) => {
    if (readOnly) return;

    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) {
        return prev.filter((s) => s !== subject);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 subjects
      }
      return [...prev, subject];
    });
  };

  const handleNext = async () => {
    if (selectedSubjects.length === 0) return;

    setIsSaving(true);
    try {
      await updateSession({
        favoriteSubjects: selectedSubjects,
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
          Select Your Favorite Subjects
        </h2>
        <p className="text-zinc-600">
          Choose up to 3 subjects that you enjoy the most
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {AVAILABLE_SUBJECTS.map((subject) => {
          const isSelected = selectedSubjects.includes(subject);
          const isDisabled =
            !isSelected && selectedSubjects.length >= 3;

          return (
            <button
              key={subject}
              onClick={() => toggleSubject(subject)}
              disabled={readOnly || isDisabled}
              className={cn(
                "p-3 rounded-lg border-2 text-left transition-all",
                isSelected
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : isDisabled
                    ? "border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300",
                readOnly && "cursor-default"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{subject}</span>
                {isSelected && (
                  <CheckIcon className="size-4 text-blue-600" weight="bold" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {selectedSubjects.length}/3 subjects selected
        </p>

        {!readOnly && (
          <button
            onClick={handleNext}
            disabled={selectedSubjects.length === 0 || isSaving}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all",
              selectedSubjects.length > 0
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
