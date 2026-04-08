import { z } from "zod";
import { getStudentScores } from "@student/db";
import { createRouteHelper } from "../../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const ListScoresInputSchema = z.object({});

export const listScoresRoute = createRouteHelper({
  inputSchema: ListScoresInputSchema,
  execute: async ({ ctx }) => {
    if (ctx.user.organization.role !== "STUDENT") {
      throw new ORPCError("FORBIDDEN", {
        message: "Only students can view their scores",
      });
    }

    return getStudentScores(ctx.user.id);
  },
});
