import {
  getOverviewByUserId,
  getOverviewStats,
  getUserName,
} from "@student/db";

import { createRouteHelper } from "../../utils/middleware";

export const getOverviewRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    const userId = ctx.user.id;
    const isAdmin = ["OWNER", "ADMIN"].includes(ctx.user.organization.role);

    let data = await getOverviewByUserId({ advisorUserId: userId });

    if (isAdmin) {
      const user = await getUserName({ userId: ctx.user.id });

      data = {
        id: ctx.user.id,
        university: "n/a",
        courseMajor: "n/a",
        createdAt: new Date(),
        user: {
          name: user?.name ?? "",
          email: user?.email ?? "",
        },
      };
    }

    const stats = await getOverviewStats({
      advisorUserId: isAdmin ? undefined : userId,
      organizationId: isAdmin ? ctx.organizationId : undefined,
    });

    return {
      ...data,
      ...stats,
    };
  },
});
