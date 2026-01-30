import { z } from "zod";
import { db, eq, schema } from "@student/db";
import { createRouteHelper } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const CompleteOnboardingInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  organizationName: z.string().min(1, "Organization name is required"),
});

export const completeOnboardingRoute = createRouteHelper({
  inputSchema: CompleteOnboardingInputSchema,
  execute: async ({ ctx, input }) => {
    const { user, organizationId } = ctx;

    if (user.organization.role !== "OWNER") {
      throw new ORPCError("FORBIDDEN", { message: "User is not an owner" });
    }

    // Update user name and status to ACTIVE
    await db
      .update(schema.user)
      .set({
        name: input.name,
        status: "ACTIVE",
      })
      .where(eq(schema.user.id, user.id));

    // Update organization name and status to ACTIVE
    await db
      .update(schema.organization)
      .set({
        name: input.organizationName,
        status: "ACTIVE",
      })
      .where(eq(schema.organization.id, organizationId));

    return { success: true };
  },
});
