import z from "zod";

import { getSessions } from "@student/db";

export const ListSessionInputSchema = z.object({
  studentUserId: z.string().optional(),
});

export const listSessions = async (
  data: z.infer<typeof ListSessionInputSchema>
) => {
  const sessions = await getSessions(data);

  return sessions.map((s) => ({
    sessionId: s.id,
    student: s.student?.name ?? "",
    createdAt: s.createdAt,
    title: s.title,
    advisor: s.advisor?.name ?? "",
  }));
};
