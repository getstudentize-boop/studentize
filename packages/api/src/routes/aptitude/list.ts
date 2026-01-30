import { z } from "zod";
import { getStudentAptitudeSessions } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const ListInputSchema = z.object({});

export type ListInput = z.infer<typeof ListInputSchema>;

export const listHandler = async (ctx: AuthContext, _input: ListInput) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.organization.role !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can list aptitude tests",
    });
  }

  const sessions = await getStudentAptitudeSessions(ctx.user.id);

  return sessions;
};
