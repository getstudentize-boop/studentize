import { z } from "zod";
import { deleteScore } from "@student/db";
import { createRouteHelper } from "../../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const DeleteScoreInputSchema = z.object({
  scoreId: z.string(),
});

export const deleteScoreRoute = createRouteHelper({
  inputSchema: DeleteScoreInputSchema,
  execute: async ({ ctx, input }) => {
    if (ctx.user.organization.role !== "STUDENT") {
      throw new ORPCError("FORBIDDEN", {
        message: "Only students can delete scores",
      });
    }

    return deleteScore({
      scoreId: input.scoreId,
      studentUserId: ctx.user.id,
    });
  },
});
