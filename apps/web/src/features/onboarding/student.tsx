import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/button";
import { ArrowRightIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import { Step1Contact } from "./steps/step1-contact";
import { Step2Country } from "./steps/step2-country";
import { Step3Graduation } from "./steps/step3-graduation";
import { Step4Destinations } from "./steps/step4-destinations";
import { Step5Interests } from "./steps/step5-interests";
import { Step6Support } from "./steps/step6-support";
import { Step7Referral } from "./steps/step7-referral";
import { useAuthUser } from "@/routes/_authenticated";
import { OrganizationLogo } from "../organization/logo";

const TOTAL_STEPS = 7;

export const StudentOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthUser();

  const completeOnboardingMutation = useMutation(
    orpc.student.completeOnboarding.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.user.current.key({ type: "query" }),
        });
        navigate({ to: "/student/dashboard" });
      },
    })
  );

  const form = useForm({
    defaultValues: {
      email: user.email,
      phone: "",
      location: "",
      expectedGraduationYear: "",
      targetCountries: [] as string[],
      areasOfInterest: [] as string[],
      supportAreas: [] as string[],
      referralSource: "",
    },
    validators: {
      onChange: z.object({
        email: z.email(),
        phone: z.string().optional(),
        location: z.string().optional(),
        expectedGraduationYear: z.string().optional(),
        targetCountries: z.array(z.string()).optional(),
        areasOfInterest: z.array(z.string()).optional(),
        supportAreas: z.array(z.string()).optional(),
        referralSource: z.string().optional(),
      }),
    },
    onSubmit: async (vals) => {
      await completeOnboardingMutation.mutateAsync({
        phone: vals.value.phone || undefined,
        location: vals.value.location || undefined,
        expectedGraduationYear: vals.value.expectedGraduationYear || undefined,
        targetCountries:
          vals.value.targetCountries.length > 0
            ? vals.value.targetCountries
            : undefined,
        areasOfInterest:
          vals.value.areasOfInterest.length > 0
            ? vals.value.areasOfInterest
            : undefined,
        supportAreas:
          vals.value.supportAreas.length > 0
            ? vals.value.supportAreas
            : undefined,
        referralSource: vals.value.referralSource || undefined,
      });
    },
  });

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit();
  };

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-2 flex-1 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="ml-4 text-sm text-zinc-600">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <OrganizationLogo className="w-24" />
        </div>

        {/* Form Content */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (currentStep === TOTAL_STEPS) {
              handleSubmit();
            } else {
              handleNext();
            }
          }}
          className="px-6 pb-6"
        >
          {currentStep === 1 && <Step1Contact form={form} />}
          {currentStep === 2 && <Step2Country form={form} />}
          {currentStep === 3 && <Step3Graduation form={form} />}
          {currentStep === 4 && <Step4Destinations form={form} />}
          {currentStep === 5 && <Step5Interests form={form} />}
          {currentStep === 6 && <Step6Support form={form} />}
          {currentStep === 7 && <Step7Referral form={form} />}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="neutral"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeftIcon size={18} />
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={completeOnboardingMutation.isPending}
            >
              {currentStep === TOTAL_STEPS ? "Complete" : "Next"}
              {currentStep !== TOTAL_STEPS && <ArrowRightIcon size={18} />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
