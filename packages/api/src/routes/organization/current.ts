import { createRouteHelper } from "../../utils/middleware";
import { db } from "@student/db";
import { ORPCError } from "@orpc/server";

export const getCurrentOrganizationRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    const organization = await db.query.organization.findFirst({
      where: (organization, { eq }) => eq(organization.id, ctx.organizationId),
      columns: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!organization) {
      throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
    }

    return organization;
  },
});
