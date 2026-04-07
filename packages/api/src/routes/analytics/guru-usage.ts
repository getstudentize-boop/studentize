import { db, sql } from "@student/db";
import { createAnalyticsRouteHelper } from "../../utils/analytics-middleware";

export const guruUsageRoute = createAnalyticsRouteHelper({
  execute: async () => {
    const [stats] = await db.execute<{
      total_sessions: number;
      avg_messages: number;
    }>(sql`
      SELECT
        (SELECT count(*)::int FROM virtual_advisor_session) AS total_sessions,
        coalesce((
          SELECT round(avg(cnt)::numeric, 1)::float
          FROM (
            SELECT count(*) AS cnt
            FROM virtual_advisor_message
            WHERE role = 'user'
            GROUP BY session_id
          ) t
        ), 0) AS avg_messages
    `);

    const advisorRows = await db.execute<{
      slug: string;
      sessions: number;
    }>(sql`
      SELECT
        advisor_slug AS slug,
        count(*)::int AS sessions
      FROM virtual_advisor_session
      GROUP BY advisor_slug
      ORDER BY count(*) DESC
    `);

    return {
      totalSessions: stats!.total_sessions,
      avgMessagesPerSession: stats!.avg_messages,
      topAdvisors: advisorRows.map((r) => ({
        label: r.slug,
        sessions: r.sessions,
      })),
    };
  },
});
