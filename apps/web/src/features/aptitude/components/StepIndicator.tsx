import { cn } from "@/utils/cn";
import { CheckIcon } from "@phosphor-icons/react";

const STEPS = [
  { number: 1, title: "Favorite Subjects" },
  { number: 2, title: "Comfort Levels" },
  { number: 3, title: "Questions" },
  { number: 4, title: "Results" },
];

type StepIndicatorProps = {
  currentStep: number;
  isCompleted: boolean;
};

export function StepIndicator({ currentStep, isCompleted }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {STEPS.map((step, index) => {
        const isActive = step.number === currentStep;
        const isPast = step.number < currentStep || isCompleted;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  isPast
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-200 text-zinc-500"
                )}
              >
                {isPast ? (
                  <CheckIcon className="size-4" weight="bold" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1 whitespace-nowrap",
                  isActive ? "text-zinc-900 font-medium" : "text-zinc-500"
                )}
              >
                {step.title}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-2 mt-[-16px]",
                  isPast ? "bg-green-500" : "bg-zinc-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
