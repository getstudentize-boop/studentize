import { AuthContext } from "@/utils/middleware";
import { ORPCError } from "@orpc/server";
import { getOneStudentAccess, getSessionSummarysByStudent } from "@student/db";
import z from "zod";

export const SessionSummaryListInputSchema = z.object({
  studentUserId: z.string(),
});

export const sessionSummaryList = async (
  ctx: AuthContext,
  input: z.infer<typeof SessionSummaryListInputSchema>
) => {
  if (ctx.user.type === "STUDENT") {
    throw new ORPCError("FORBIDDEN");
  }

  if (ctx.user.type === "ADVISOR") {
    const advisorUserId = ctx.user.id;
    const access = await getOneStudentAccess({
      advisorUserId,
      studentUserId: input.studentUserId,
    });

    if (!access) {
      throw new ORPCError("FORBIDDEN");
    }
  }

  const summaries = await getSessionSummarysByStudent({
    studentUserId: input.studentUserId,
  });

  return summaries;
};
