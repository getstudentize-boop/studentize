import { db, sql } from "@student/db";
import { createAnalyticsRouteHelper } from "../../utils/analytics-middleware";

export const guruChatMessagesRoute = createAnalyticsRouteHelper({
  inputSchema: undefined as unknown as { chatId: string },
  execute: async ({ input }) => {
    const [chat] = await db.execute<{
      id: string;
      title: string;
      student_name: string | null;
      student_email: string;
      created_at: string;
    }>(sql`
      SELECT
        c.id,
        c.title,
        u.name AS student_name,
        u.email AS student_email,
        c.created_at::text AS created_at
      FROM advisor_chat c
      JOIN "user" u ON u.id = c.student_id
      WHERE c.id = ${input.chatId}
    `);

    if (!chat) return null;

    const messages = await db.execute<{
      id: string;
      content: string;
      role: string;
      created_at: string;
    }>(sql`
      SELECT id, content, role, created_at::text AS created_at
      FROM advisor_chat_message
      WHERE chat_id = ${input.chatId}
      ORDER BY created_at ASC
    `);

    return {
      id: chat.id,
      title: chat.title,
      studentName: chat.student_name,
      studentEmail: chat.student_email,
      createdAt: chat.created_at,
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        role: m.role as "user" | "assistant",
        createdAt: m.created_at,
      })),
    };
  },
});
