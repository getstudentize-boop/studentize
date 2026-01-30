import { AuthContext } from "@/utils/middleware";
import { ORPCError } from "@orpc/server";
import {
  getOneStudentAccess,
  getSessionSummarysByStudent,
  getStudentSessionOverview,
} from "@student/db";
import z from "zod";

export const SessionSummaryListInputSchema = z.object({
  studentUserId: z.string(),
});

export const sessionSummaryList = async (
  ctx: AuthContext,
  input: z.infer<typeof SessionSummaryListInputSchema>
) => {
  try {
    if (ctx.user.organization.role === "STUDENT") {
      throw new ORPCError("FORBIDDEN");
    }

    if (ctx.user.organization.role === "ADVISOR") {
      const advisorUserId = ctx.user.id;
      const access = await getOneStudentAccess({
        advisorUserId,
        studentUserId: input.studentUserId,
      });

      if (!access) {
        throw new ORPCError("FORBIDDEN");
      }
    }

    const [summaries, overview] = await Promise.all([
      getSessionSummarysByStudent({
        studentUserId: input.studentUserId,
      }),
      getStudentSessionOverview(input.studentUserId),
    ]);

    return { summaries, overview: overview?.sessionOverview };
  } catch (error) {
    console.error(error);
    throw new ORPCError("FORBIDDEN");
  }
};
