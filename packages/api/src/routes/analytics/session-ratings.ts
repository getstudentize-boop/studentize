import { db, sql } from "@student/db";
import { createAnalyticsRouteHelper } from "../../utils/analytics-middleware";

export const sessionRatingsRoute = createAnalyticsRouteHelper({
  execute: async () => {
    const rows = await db.execute<{
      stars: number;
      count: number;
    }>(sql`
      SELECT
        r.stars,
        count(s.rating)::int AS count
      FROM generate_series(1, 5) AS r(stars)
      LEFT JOIN session s ON s.rating = r.stars
      GROUP BY r.stars
      ORDER BY r.stars DESC
    `);

    const ratings = rows.map((r) => ({ stars: r.stars, count: r.count }));
    const total = ratings.reduce((s, r) => s + r.count, 0);
    const avg =
      total > 0
        ? (ratings.reduce((s, r) => s + r.stars * r.count, 0) / total).toFixed(
            1,
          )
        : "0.0";

    return { ratings, total, avg };
  },
});
