import { z } from "zod";
import { updateShortlistItem } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const UpdateShortlistInputSchema = z.object({
  id: z.string(),
  category: z.enum(["reach", "target", "safety"]).nullable().optional(),
  notes: z.string().optional(),
});

export type UpdateShortlistInput = z.infer<typeof UpdateShortlistInputSchema>;

export const updateShortlist = async (
  ctx: AuthContext,
  input: UpdateShortlistInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.type !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can update their shortlist",
    });
  }

  const updated = await updateShortlistItem({
    id: input.id,
    studentUserId: ctx.user.id,
    category: input.category !== undefined ? input.category : undefined,
    notes: input.notes,
  });

  return updated;
};
