import { db, sql } from "@student/db";
import { createAnalyticsRouteHelper } from "../../utils/analytics-middleware";

export const guruChatsRoute = createAnalyticsRouteHelper({
  execute: async () => {
    const [stats] = await db.execute<{
      total_sessions: number;
      sessions_this_week: number;
      avg_student_messages: number;
    }>(sql`
      SELECT
        (SELECT count(*)::int FROM advisor_chat WHERE user_id = student_id) AS total_sessions,
        (SELECT count(*)::int FROM advisor_chat
         WHERE user_id = student_id
           AND created_at >= date_trunc('week', now())) AS sessions_this_week,
        coalesce((
          SELECT round(avg(cnt)::numeric, 1)::float
          FROM (
            SELECT count(*) AS cnt
            FROM advisor_chat_message m
            JOIN advisor_chat c ON c.id = m.chat_id
            WHERE c.user_id = c.student_id
              AND m.role = 'user'
            GROUP BY m.chat_id
          ) t
        ), 0) AS avg_student_messages
    `);

    const rows = await db.execute<{
      id: string;
      title: string;
      student_name: string | null;
      student_email: string;
      message_count: number;
      last_message_at: string;
      created_at: string;
    }>(sql`
      SELECT
        c.id,
        c.title,
        u.name AS student_name,
        u.email AS student_email,
        count(m.id) FILTER (WHERE m.role = 'user')::int AS message_count,
        max(m.created_at)::text AS last_message_at,
        c.created_at::text AS created_at
      FROM advisor_chat c
      JOIN "user" u ON u.id = c.student_id
      LEFT JOIN advisor_chat_message m ON m.chat_id = c.id
      WHERE c.user_id = c.student_id
      GROUP BY c.id, u.name, u.email
      ORDER BY max(m.created_at) DESC NULLS LAST
      LIMIT 50
    `);

    return {
      totalSessions: stats!.total_sessions,
      sessionsThisWeek: stats!.sessions_this_week,
      avgStudentMessages: stats!.avg_student_messages,
      chats: rows.map((r) => ({
        id: r.id,
        title: r.title,
        studentName: r.student_name,
        studentEmail: r.student_email,
        messageCount: r.message_count,
        lastMessageAt: r.last_message_at,
        createdAt: r.created_at,
      })),
    };
  },
});
