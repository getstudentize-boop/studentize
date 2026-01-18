import { z } from "zod";
import { addToShortlist } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const AddToShortlistInputSchema = z.object({
  collegeId: z.string(),
  country: z.enum(["us", "uk"]),
  category: z.enum(["reach", "target", "safety"]).optional(),
  source: z.enum(["ai", "manual"]).default("manual"),
  notes: z.string().optional(),
});

export type AddToShortlistInput = z.infer<typeof AddToShortlistInputSchema>;

export const addUniversityToShortlist = async (
  ctx: AuthContext,
  input: AddToShortlistInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.type !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can add universities to shortlist",
    });
  }

  const shortlistItem = await addToShortlist({
    studentUserId: ctx.user.id,
    collegeId: input.collegeId,
    country: input.country,
    category: input.category || null,
    source: input.source,
    notes: input.notes || null,
  });

  return shortlistItem;
};
