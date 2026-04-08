import { db, sql } from "@student/db";
import { createAnalyticsRouteHelper } from "../../utils/analytics-middleware";

export const activeStudentsRoute = createAnalyticsRouteHelper({
  execute: async () => {
    const rows = await db.execute<{
      week_label: string;
      active_count: number;
    }>(sql`
      WITH weeks AS (
        SELECT
          generate_series(
            date_trunc('week', now() - interval '5 weeks'),
            date_trunc('week', now()),
            interval '1 week'
          ) AS week_start
      ),
      activity AS (
        SELECT student_user_id, created_at FROM essay
        UNION ALL
        SELECT student_user_id, created_at FROM university_shortlist
        UNION ALL
        SELECT student_user_id, created_at FROM student_task
        UNION ALL
        SELECT student_user_id, created_at FROM session WHERE student_user_id IS NOT NULL
        UNION ALL
        SELECT student_user_id, created_at FROM aptitude_test_session
        UNION ALL
        SELECT student_user_id, created_at FROM virtual_advisor_session
      )
      SELECT
        to_char(w.week_start, 'Mon DD') AS week_label,
        count(DISTINCT a.student_user_id)::int AS active_count
      FROM weeks w
      LEFT JOIN activity a
        ON a.created_at >= w.week_start
        AND a.created_at < w.week_start + interval '1 week'
      GROUP BY w.week_start
      ORDER BY w.week_start
    `);

    const weeks = rows.map((r) => ({
      label: r.week_label,
      value: r.active_count,
    }));

    const current = weeks[weeks.length - 1]?.value ?? 0;
    const previous = weeks[weeks.length - 2]?.value ?? 0;
    const changePct =
      previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;

    return { weeks, current, changePct };
  },
});
