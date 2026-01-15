import { z } from "zod";
import { createEssay } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const CreateEssayInputSchema = z.object({
  title: z.string(),
  prompt: z.string().optional(),
});

export type CreateEssayInput = z.infer<typeof CreateEssayInputSchema>;

export const createEssayHandler = async (
  ctx: AuthContext,
  input: CreateEssayInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.type !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can create essays",
    });
  }

  const essay = await createEssay({
    studentUserId: ctx.user.id,
    title: input.title,
    prompt: input.prompt || null,
    content: null,
  });

  return essay;
};
