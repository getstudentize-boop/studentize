import { db, sql } from "@student/db";
import { createAnalyticsRouteHelper } from "../../utils/analytics-middleware";

export const conversionRateRoute = createAnalyticsRouteHelper({
  execute: async () => {
    const rows = await db.execute<{
      label: string;
      free: number;
      paid: number;
    }>(sql`
      SELECT
        to_char(created_at, 'Mon') AS label,
        count(*) FILTER (WHERE tier = 'FREE')::int AS free,
        count(*) FILTER (WHERE tier = 'PAID')::int AS paid
      FROM student
      WHERE created_at >= date_trunc('month', now() - interval '5 months')
      GROUP BY to_char(created_at, 'Mon'), date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at)
    `);

    const months = rows.map((r) => ({
      label: r.label,
      free: r.free,
      paid: r.paid,
    }));

    const totalFree = months.reduce((s, m) => s + m.free, 0);
    const totalPaid = months.reduce((s, m) => s + m.paid, 0);
    const conversionRate =
      totalFree + totalPaid > 0
        ? Math.round((totalPaid / (totalFree + totalPaid)) * 100)
        : 0;

    return { months, totalFree, totalPaid, conversionRate };
  },
});
