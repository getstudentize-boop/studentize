import { type } from "@orpc/server";
import { analyticsRoute } from "../../utils/analytics-middleware";

import { onboardingCompletionRoute } from "./onboarding-completion";
import { activeStudentsRoute } from "./active-students";
import { featureAdoptionRoute } from "./feature-adoption";
import { shortlistBreakdownRoute } from "./shortlist-breakdown";
import { conversionRateRoute } from "./conversion-rate";
import { guruUsageRoute } from "./guru-usage";
import { sessionRatingsRoute } from "./session-ratings";
import { taskCompletionRoute } from "./task-completion";
import { analyticsChat, type AnalyticsChatInput } from "./chat";

export const analytics = {
  onboardingCompletion: analyticsRoute.handler(onboardingCompletionRoute),
  activeStudents: analyticsRoute.handler(activeStudentsRoute),
  featureAdoption: analyticsRoute.handler(featureAdoptionRoute),
  shortlistBreakdown: analyticsRoute.handler(shortlistBreakdownRoute),
  conversionRate: analyticsRoute.handler(conversionRateRoute),
  guruUsage: analyticsRoute.handler(guruUsageRoute),
  sessionRatings: analyticsRoute.handler(sessionRatingsRoute),
  taskCompletion: analyticsRoute.handler(taskCompletionRoute),
  chat: analyticsRoute
    .input(type<AnalyticsChatInput>())
    .handler(({ input }) => analyticsChat(input)),
};
