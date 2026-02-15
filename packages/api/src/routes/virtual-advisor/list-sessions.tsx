import { getVirtualAdvisorSessionsByStudent } from "@student/db";

export const listSessionsRoute = async ({
  context,
}: {
  context: { user: { id: string } };
}) => {
    const sessions = await getVirtualAdvisorSessionsByStudent({
      studentUserId: context.user.id,
    });

    return sessions.map((session) => ({
      id: session.id,
      title: session.title,
      advisorSlug: session.advisorSlug,
      createdAt: session.createdAt,
      endedAt: session.endedAt,
    }));
};
