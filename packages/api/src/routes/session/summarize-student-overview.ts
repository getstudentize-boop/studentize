import { AuthContext } from "@/utils/middleware";
import z from "zod";

import { authenticateSession } from "../../route-utils";
import {
  getStudentSessionOverview,
  updateStudentSessionOverview,
} from "@student/db";

import { summarizeSessionOverview } from "@student/ai/services";

export const SummarizeStudentOverviewInputSchema = z.object({
  sessionId: z.string(),
});

export const summarizeStudentOverview = async (
  ctx: AuthContext,
  data: z.infer<typeof SummarizeStudentOverviewInputSchema>
) => {
  const session = await authenticateSession(ctx, { sessionId: data.sessionId });

  const student = await getStudentSessionOverview(session.studentUserId);

  const newSessionOverview = await summarizeSessionOverview({
    transcriptSummary: session.summary ?? "",
    studentSessionOverview: student?.sessionOverview ?? "",
  });

  await updateStudentSessionOverview({
    studentUserId: session.studentUserId,
    sessionOverview: newSessionOverview,
  });
};
