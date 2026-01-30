import { z } from "zod";
import { updateEssay } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const UpdateEssayInputSchema = z.object({
  essayId: z.string(),
  content: z.any().optional(),
  title: z.string().optional(),
  prompt: z.string().optional(),
});

export type UpdateEssayInput = z.infer<typeof UpdateEssayInputSchema>;

export const updateEssayHandler = async (
  ctx: AuthContext,
  input: UpdateEssayInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.organization.role !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can update their essays",
    });
  }

  const essay = await updateEssay({
    essayId: input.essayId,
    studentUserId: ctx.user.id,
    content: input.content,
    title: input.title,
    prompt: input.prompt,
  });

  return essay;
};
