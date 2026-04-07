import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "../../../utils/openai";
import { getEssayById } from "@student/db";
import type { AuthContext } from "../../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const AiCheckInputSchema = z.object({
  essayId: z.string(),
  essayText: z.string(),
});

export type AiCheckInput = z.infer<typeof AiCheckInputSchema>;

const AiCheckResultSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Likelihood score from 0-100 that the essay was AI-written. 0 = definitely human, 100 = definitely AI."),
  summary: z
    .string()
    .describe("A brief 2-3 sentence explanation of the assessment, highlighting specific indicators."),
  indicators: z
    .array(
      z.object({
        label: z.string().describe("Short name of the indicator"),
        detail: z.string().describe("One sentence explanation"),
        signal: z.enum(["human", "ai", "neutral"]).describe("Whether this points to human or AI authorship"),
      }),
    )
    .describe("3-5 specific indicators found in the text"),
});

export const aiCheckHandler = async (ctx: AuthContext, input: AiCheckInput) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.organization.role !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can check their essays",
    });
  }

  const essay = await getEssayById({
    essayId: input.essayId,
    studentUserId: ctx.user.id,
  });

  if (!essay) {
    throw new ORPCError("NOT_FOUND", { message: "Essay not found" });
  }

  if (!input.essayText.trim()) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Essay has no content to check",
    });
  }

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: AiCheckResultSchema,
    prompt: [
      "You are an AI content detection specialist. Analyze the following essay and assess the likelihood it was written by AI.",
      "",
      "Consider these factors:",
      "- Vocabulary patterns: AI tends to use overly sophisticated or uniform vocabulary",
      "- Sentence structure: AI often produces consistently structured sentences lacking natural variation",
      "- Personal voice: Human essays have unique voice, quirks, and authentic personal details",
      "- Transitions: AI uses formulaic transitions (\"Furthermore\", \"Moreover\", \"In conclusion\")",
      "- Specificity: Human writers include specific, lived-experience details; AI tends to be generic",
      "- Imperfections: Human writing has natural imperfections; AI is often too polished",
      "",
      "ESSAY TEXT:",
      input.essayText,
    ].join("\n"),
  });

  return object;
};
