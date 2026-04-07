import { analytics } from "./routes/analytics";

export const analyticsRouter = {
  ...analytics,
};

export { createAnalyticsRouteHelper } from "./utils/analytics-middleware";
