import { db, sql } from "@student/db";
import { createAnalyticsRouteHelper } from "../../utils/analytics-middleware";

export const taskCompletionRoute = createAnalyticsRouteHelper({
  execute: async () => {
    const rows = await db.execute<{
      category: string;
      pending: number;
      in_progress: number;
      completed: number;
    }>(sql`
      SELECT
        CASE
          WHEN category IN ('exams', 'sat_act') THEN 'Exams / SAT·ACT'
          WHEN category = 'university_research' THEN 'University Research'
          WHEN category = 'essay_writing' THEN 'Essay Writing'
          WHEN category = 'profile_building' THEN 'Profile Building'
          ELSE 'Other'
        END AS category,
        count(*) FILTER (WHERE status = 'pending')::int AS pending,
        count(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
        count(*) FILTER (WHERE status = 'completed')::int AS completed
      FROM student_task
      GROUP BY 1
      ORDER BY count(*) DESC
    `);

    const categories = rows.map((r) => ({
      label: r.category,
      pending: r.pending,
      inProgress: r.in_progress,
      completed: r.completed,
    }));

    const totalTasks = categories.reduce(
      (s, c) => s + c.pending + c.inProgress + c.completed,
      0,
    );
    const totalCompleted = categories.reduce((s, c) => s + c.completed, 0);
    const completionRate =
      totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    return { categories, totalTasks, totalCompleted, completionRate };
  },
});
