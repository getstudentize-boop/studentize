import { privateRoute } from "../../utils/middleware";
import { getCurrentOrganizationRoute } from "./current";
import {
  completeOnboardingRoute,
  CompleteOnboardingInputSchema,
} from "./complete-onboarding";

export const organization = {
  current: privateRoute.handler(getCurrentOrganizationRoute),
  completeOnboarding: privateRoute
    .input(CompleteOnboardingInputSchema)
    .handler(completeOnboardingRoute),
};
