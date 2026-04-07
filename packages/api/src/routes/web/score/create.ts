import { z } from "zod";
import { createScore } from "@student/db";
import { createRouteHelper } from "../../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const CreateScoreInputSchema = z.object({
  subject: z.string().min(1),
  score: z.number().min(0),
  maxScore: z.number().min(1),
  examDate: z.string().datetime(),
  notes: z.string().optional(),
});

export const createScoreRoute = createRouteHelper({
  inputSchema: CreateScoreInputSchema,
  execute: async ({ ctx, input }) => {
    if (ctx.user.organization.role !== "STUDENT") {
      throw new ORPCError("FORBIDDEN", {
        message: "Only students can log scores",
      });
    }

    const score = await createScore({
      studentUserId: ctx.user.id,
      subject: input.subject,
      score: input.score,
      maxScore: input.maxScore,
      examDate: new Date(input.examDate),
      notes: input.notes || null,
    });

    return score;
  },
});
