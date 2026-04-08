import { db, sql } from "@student/db";
import { createAnalyticsRouteHelper } from "../../utils/analytics-middleware";

export const featureAdoptionRoute = createAnalyticsRouteHelper({
  execute: async () => {
    const [result] = await db.execute<{
      total_students: number;
      university_explorer: number;
      essays: number;
      guru_ai: number;
      aptitude_test: number;
      sessions: number;
      score_tracking: number;
    }>(sql`
      SELECT
        (SELECT count(*)::int FROM student) AS total_students,
        (SELECT count(DISTINCT student_user_id)::int FROM university_shortlist) AS university_explorer,
        (SELECT count(DISTINCT student_user_id)::int FROM essay) AS essays,
        (SELECT count(DISTINCT student_user_id)::int FROM virtual_advisor_session) AS guru_ai,
        (SELECT count(DISTINCT student_user_id)::int FROM aptitude_test_session) AS aptitude_test,
        (SELECT count(DISTINCT student_user_id)::int FROM session WHERE student_user_id IS NOT NULL) AS sessions,
        (SELECT count(DISTINCT student_user_id)::int FROM student_score) AS score_tracking
    `);

    const r = result!;

    const features = [
      { label: "University Explorer", users: r.university_explorer },
      { label: "Essays", users: r.essays },
      { label: "Guru AI", users: r.guru_ai },
      { label: "Aptitude Test", users: r.aptitude_test },
      { label: "Sessions", users: r.sessions },
      { label: "Score Tracking", users: r.score_tracking },
    ];

    return { totalStudents: r.total_students, features };
  },
});
