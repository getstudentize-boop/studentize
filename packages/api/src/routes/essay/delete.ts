import { z } from "zod";
import { deleteEssay } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const DeleteEssayInputSchema = z.object({
  essayId: z.string(),
});

export type DeleteEssayInput = z.infer<typeof DeleteEssayInputSchema>;

export const deleteEssayHandler = async (
  ctx: AuthContext,
  input: DeleteEssayInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.organization.role !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can delete their essays",
    });
  }

  await deleteEssay({
    essayId: input.essayId,
    studentUserId: ctx.user.id,
  });

  return { success: true };
};
