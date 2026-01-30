import { z } from "zod";
import { removeFromShortlist } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const RemoveFromShortlistInputSchema = z.object({
  id: z.string(),
});

export type RemoveFromShortlistInput = z.infer<
  typeof RemoveFromShortlistInputSchema
>;

export const removeUniversityFromShortlist = async (
  ctx: AuthContext,
  input: RemoveFromShortlistInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.organization.role !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can remove universities from shortlist",
    });
  }

  await removeFromShortlist({
    id: input.id,
    studentUserId: ctx.user.id,
  });

  return { success: true };
};
