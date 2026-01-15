import { z } from "zod";
import { getStudentShortlistWithDetails } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const GetMyShortlistInputSchema = z.object({});

export type GetMyShortlistInput = z.infer<typeof GetMyShortlistInputSchema>;

export const getMyShortlist = async (
  ctx: AuthContext,
  _input: GetMyShortlistInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.type !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can view their shortlist",
    });
  }

  const shortlist = await getStudentShortlistWithDetails(ctx.user.id);

  return shortlist;
};
