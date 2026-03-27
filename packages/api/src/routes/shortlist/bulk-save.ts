import { z } from "zod";
import { bulkReplaceShortlist } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const BulkSaveShortlistInputSchema = z.object({
  universities: z.array(
    z.object({
      name: z.string(),
      country: z.string(),
      category: z.enum(["reach", "target", "safety"]),
      notes: z.string().optional(),
    }),
  ),
  virtualAdvisorSessionId: z.string().optional(),
});

export type BulkSaveShortlistInput = z.infer<
  typeof BulkSaveShortlistInputSchema
>;

export const bulkSaveShortlist = async (
  ctx: AuthContext,
  input: BulkSaveShortlistInput,
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  // if (ctx.user.organization.role !== "STUDENT") {
  //   throw new ORPCError("FORBIDDEN", {
  //     message: "Only students can save a shortlist",
  //   });
  // }

  // Map the university names to shortlist insert records
  // Since these come from the AI advisor (not from our college DB), we store
  // the university name as the collegeId — these are AI-sourced entries
  const items = input.universities.map((u) => ({
    studentUserId: ctx.user.id,
    collegeId: u.name, // Store name as identifier for AI-sourced entries
    country: u.country === "us" || u.country === "uk" ? u.country : u.country,
    category: u.category,
    source: "ai" as const,
    notes: u.notes || null,
    virtualAdvisorSessionId: input.virtualAdvisorSessionId || null,
  }));

  const result = await bulkReplaceShortlist({
    studentUserId: ctx.user.id,
    items,
  });

  return { success: true, count: result.length };
};
