import { db, sql } from "@student/db";
import { createAnalyticsRouteHelper } from "../../utils/analytics-middleware";

export const guruUsageRoute = createAnalyticsRouteHelper({
  execute: async () => {
    const rows = await db.execute<{
      name: string | null;
      email: string;
      sessions: number;
    }>(sql`
      SELECT
        u.name,
        u.email,
        count(*)::int AS sessions
      FROM advisor_chat c
      JOIN "user" u ON u.id = c.student_id
      WHERE c.user_id = c.student_id
      GROUP BY u.id, u.name, u.email
      ORDER BY count(*) DESC
      LIMIT 10
    `);

    return rows.map((r) => ({
      name: r.name,
      email: r.email,
      sessions: r.sessions,
    }));
  },
});
