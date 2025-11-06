import { ORPCError } from "@orpc/server";
import z from "zod";

import { createRouteHelper } from "../../utils/middleware";

import { deleteScheduledSessionById } from "@student/db";

export const DeleteScheduledSessionInputSchema = z.object({
  scheduledSessionId: z.string(),
});

export const deleteScheduledSessionRoute = createRouteHelper({
  inputSchema: DeleteScheduledSessionInputSchema,
  execute: async ({ ctx, input }) => {
    if (ctx.user.type !== "ADMIN") {
      throw new ORPCError("FORBIDDEN", { message: "Unauthorized" });
    }

    await deleteScheduledSessionById({
      scheduledSessionId: input.scheduledSessionId,
    });

    return { success: true };
  },
});
