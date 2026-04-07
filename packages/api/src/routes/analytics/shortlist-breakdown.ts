import { db, sql } from "@student/db";
import { createAnalyticsRouteHelper } from "../../utils/analytics-middleware";

export const shortlistBreakdownRoute = createAnalyticsRouteHelper({
  execute: async () => {
    const [result] = await db.execute<{
      total: number;
      reach: number;
      target: number;
      safety: number;
      ai: number;
      manual: number;
    }>(sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE category = 'reach')::int AS reach,
        count(*) FILTER (WHERE category = 'target')::int AS target,
        count(*) FILTER (WHERE category = 'safety')::int AS safety,
        count(*) FILTER (WHERE source = 'ai')::int AS ai,
        count(*) FILTER (WHERE source = 'manual')::int AS manual
      FROM university_shortlist
    `);

    const r = result!;

    const categories = [
      { label: "Reach", value: r.reach },
      { label: "Target", value: r.target },
      { label: "Safety", value: r.safety },
    ];

    const sources = { ai: r.ai, manual: r.manual };

    return { categories, sources, total: r.total };
  },
});
