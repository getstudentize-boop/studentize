import { createRouteHelper } from "../../utils/middleware";
import z from "zod";

import { getOneStudentAccess, getSessions, getUserName } from "@student/db";
import { ORPCError } from "@orpc/server";

export const GetStudentSessionsInputSchema = z.object({
  studentUserId: z.string(),
});

export const getStudentSessionsRoute = createRouteHelper({
  inputSchema: GetStudentSessionsInputSchema,
  execute: async ({ ctx, input }) => {
    if (ctx.user.organization.role === "STUDENT") {
      throw new ORPCError("UNAUTHORIZED", {
        message: "You not authorized to fetch",
      });
    }

    if (ctx.user.organization.role === "ADVISOR") {
      const access = await getOneStudentAccess({
        advisorUserId: ctx.user.id,
        studentUserId: input.studentUserId,
      });

      if (!access) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "You are not authorized to fetch this information",
        });
      }
    }

    const sessions = await getSessions({ studentUserId: input.studentUserId });
    const user = await getUserName({ userId: input.studentUserId });

    return {
      ...user,
      sessions,
    };
  },
});
