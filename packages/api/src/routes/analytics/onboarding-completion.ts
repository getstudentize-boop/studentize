import { db, sql } from "@student/db";
import { createAnalyticsRouteHelper } from "../../utils/analytics-middleware";

export const onboardingCompletionRoute = createAnalyticsRouteHelper({
  execute: async () => {
    const [result] = await db.execute<{
      total: number;
      contact_info: number;
      country: number;
      graduation_year: number;
      destinations: number;
      interests: number;
      support_needs: number;
      completed: number;
    }>(sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE phone IS NOT NULL)::int AS contact_info,
        count(*) FILTER (WHERE target_countries IS NOT NULL AND jsonb_array_length(target_countries) > 0)::int AS country,
        count(*) FILTER (WHERE expected_graduation_year IS NOT NULL)::int AS graduation_year,
        count(*) FILTER (WHERE target_countries IS NOT NULL AND jsonb_array_length(target_countries) > 0)::int AS destinations,
        count(*) FILTER (WHERE areas_of_interest IS NOT NULL AND jsonb_array_length(areas_of_interest) > 0)::int AS interests,
        count(*) FILTER (WHERE support_areas IS NOT NULL AND jsonb_array_length(support_areas) > 0)::int AS support_needs,
        count(*) FILTER (WHERE onboarding_completed = true)::int AS completed
      FROM student
    `);

    const r = result!;

    const steps = [
      { label: "Contact Info", value: r.contact_info },
      { label: "Country", value: r.country },
      { label: "Graduation Year", value: r.graduation_year },
      { label: "Destinations", value: r.destinations },
      { label: "Interests", value: r.interests },
      { label: "Support Needs", value: r.support_needs },
      { label: "Referral & Terms", value: r.completed },
    ];

    const completionRate =
      r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;

    return { steps, total: r.total, completionRate };
  },
});
