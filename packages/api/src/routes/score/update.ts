import { z } from "zod";
import { updateScore } from "@student/db";
import { createRouteHelper } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const UpdateScoreInputSchema = z.object({
  scoreId: z.string(),
  subject: z.string().min(1).optional(),
  score: z.number().min(0).optional(),
  maxScore: z.number().min(1).optional(),
  examDate: z.string().datetime().optional(),
  notes: z.string().nullable().optional(),
});

export const updateScoreRoute = createRouteHelper({
  inputSchema: UpdateScoreInputSchema,
  execute: async ({ ctx, input }) => {
    if (ctx.user.organization.role !== "STUDENT") {
      throw new ORPCError("FORBIDDEN", {
        message: "Only students can update scores",
      });
    }

    const { scoreId, examDate, ...rest } = input;

    return updateScore({
      scoreId,
      studentUserId: ctx.user.id,
      ...rest,
      ...(examDate ? { examDate: new Date(examDate) } : {}),
    });
  },
});
