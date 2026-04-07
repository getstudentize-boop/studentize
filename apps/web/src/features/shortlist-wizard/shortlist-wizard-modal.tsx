import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import {
  XIcon,
  SparkleIcon,
  CircleNotchIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { cn } from "@/utils/cn";
import { ShortlistConfirmationDialog } from "@/features/shortlist-confirmation-dialog";
import type { ShortlistUniversity } from "@/hooks/use-webrtc";

import { WizardData, DEFAULT_WIZARD_DATA, Curriculum } from "./types";
import { StepAcademics } from "./step-academics";
import { StepPreferences } from "./step-preferences";
import { StepInterests } from "./step-interests";

interface ShortlistWizardModalProps {
  onClose: () => void;
}

const STEPS = [
  { id: 1, title: "Academics", description: "Your grades & test scores" },
  { id: 2, title: "Preferences", description: "Campus & location" },
  { id: 3, title: "Interests", description: "Major & activities" },
];

export function ShortlistWizardModal({ onClose }: ShortlistWizardModalProps) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(DEFAULT_WIZARD_DATA);
  const [universities, setUniversities] = useState<ShortlistUniversity[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [shortlistError, setShortlistError] = useState<string | null>(null);

  // Fetch existing student profile to pre-fill
  const { data: studentProfile } = useQuery(
    orpc.student.getMyProfile.queryOptions({ input: {} })
  );

  // Pre-fill wizard data from profile
  useEffect(() => {
    if (studentProfile) {
      setWizardData((prev) => ({
        ...prev,
        curriculum: mapCurriculum(studentProfile.studyCurriculum),
        targetCountries: (studentProfile.targetCountries || []).map((c) =>
          c.toLowerCase().includes("united states") || c.toLowerCase() === "us" || c.toLowerCase() === "usa"
            ? "us"
            : c.toLowerCase().includes("united kingdom") || c.toLowerCase() === "uk"
              ? "uk"
              : c
        ).filter((c) => c === "us" || c === "uk"),
        intendedMajors: studentProfile.areasOfInterest || [],
        extracurriculars: (studentProfile.extracurricular || []).map(
          (e) => e.name
        ),
      }));
    }
  }, [studentProfile]);

  const generateMutation = useMutation(
    orpc.shortlist.generate.mutationOptions({
      onSuccess: (data) => {
        setUniversities(
          data.universities.map((u) => ({
            name: u.name,
            country: u.country,
            category: u.category as "reach" | "target" | "safety",
            notes: u.notes,
          }))
        );
      },
    })
  );

  const bulkSaveMutation = useMutation(
    orpc.shortlist.bulkSave.mutationOptions()
  );

  const handleDataChange = (partialData: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...partialData }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = () => {
    setShortlistError(null);
    // Pass wizard data to generate mutation
    generateMutation.mutate({
      preferences: {
        curriculum: wizardData.curriculum,
        gpa: wizardData.gpa,
        grades: wizardData.grades,
        testScores: wizardData.testScores,
        targetCountries: wizardData.targetCountries,
        campusPreference: wizardData.campusPreference,
        classSizePreference: wizardData.classSizePreference,
        intendedMajors: wizardData.intendedMajors,
        extracurriculars: wizardData.extracurriculars,
        additionalNotes: wizardData.additionalNotes,
      },
    });
  };

  const handleConfirm = async () => {
    if (!universities) return;
    setShortlistError(null);
    try {
      await bulkSaveMutation.mutateAsync({ universities });
      setSaved(true);
      queryClient.invalidateQueries({
        queryKey: orpc.shortlist.getMyShortlist.queryOptions({ input: {} }).queryKey,
      });
    } catch {
      setShortlistError("Failed to save your shortlist. Please try again.");
    }
  };

  // Show confirmation dialog once universities are generated
  if (universities) {
    return (
      <ShortlistConfirmationDialog
        universities={universities}
        isOpen
        isSaved={saved}
        onConfirm={handleConfirm}
        onCancel={saved ? onClose : () => setUniversities(null)}
        isSaving={bulkSaveMutation.isPending}
        error={shortlistError}
      />
    );
  }

  // Show generating state
  if (generateMutation.isPending) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full">
              <CircleNotchIcon size={32} className="text-purple-600 animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium text-zinc-900">Generating your shortlist...</p>
              <p className="text-sm text-zinc-500 mt-1">
                Analyzing your profile and finding the best matches
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canProceed = validateStep(currentStep, wizardData);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
              <SparkleIcon size={20} className="text-purple-600" weight="fill" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">AI Shortlist Generator</h2>
              <p className="text-xs text-zinc-500">
                Step {currentStep} of 3: {STEPS[currentStep - 1].title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pt-4 flex-shrink-0">
          <div className="flex gap-2">
            {STEPS.map((step) => (
              <div key={step.id} className="flex-1">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-colors",
                    step.id < currentStep
                      ? "bg-green-500"
                      : step.id === currentStep
                        ? "bg-blue-500"
                        : "bg-zinc-200"
                  )}
                />
                <div className="mt-2 flex items-center gap-1.5">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                      step.id < currentStep
                        ? "bg-green-500 text-white"
                        : step.id === currentStep
                          ? "bg-blue-500 text-white"
                          : "bg-zinc-200 text-zinc-500"
                    )}
                  >
                    {step.id < currentStep ? (
                      <CheckIcon size={12} weight="bold" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      step.id === currentStep ? "text-zinc-900" : "text-zinc-500"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-5 overflow-y-auto flex-1">
          {currentStep === 1 && (
            <StepAcademics data={wizardData} onChange={handleDataChange} />
          )}
          {currentStep === 2 && (
            <StepPreferences data={wizardData} onChange={handleDataChange} />
          )}
          {currentStep === 3 && (
            <StepInterests data={wizardData} onChange={handleDataChange} />
          )}

          {generateMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                Something went wrong. Please try again.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-200 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftIcon size={16} />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all",
              currentStep === 3
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-sm disabled:opacity-50"
                : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            )}
          >
            {currentStep === 3 ? (
              <>
                <SparkleIcon size={16} weight="fill" />
                Generate Shortlist
              </>
            ) : (
              <>
                Next
                <ArrowRightIcon size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function validateStep(step: number, data: WizardData): boolean {
  switch (step) {
    case 1:
      // At least curriculum selected
      return data.curriculum !== null;
    case 2:
      // At least one country selected
      return data.targetCountries.length > 0;
    case 3:
      // At least one major selected
      return data.intendedMajors.length > 0;
    default:
      return false;
  }
}

function mapCurriculum(curriculum: string | null | undefined): Curriculum | null {
  if (!curriculum) return null;
  const lower = curriculum.toLowerCase();
  if (lower.includes("ib")) return "ib";
  if (lower.includes("a-level") || lower.includes("a level")) return "a_levels";
  if (lower.includes("ap")) return "ap";
  if (lower.includes("gcse")) return "gcse";
  if (lower.includes("cbse")) return "cbse";
  if (lower.includes("icse")) return "icse";
  if (lower.includes("us") || lower.includes("american")) return "us_high_school";
  return "other";
}
