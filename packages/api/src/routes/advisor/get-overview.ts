import {
  getOverviewByUserId,
  getOverviewStats,
  getUserById,
  getUserName,
} from "@student/db";

import { createRouteHelper } from "../../utils/middleware";

export const getOverviewRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    const userId = ctx.user.id;

    let data = await getOverviewByUserId({ advisorUserId: userId });

    if (ctx.user.type === "ADMIN") {
      const user = await getUserName(ctx.user.id);

      data = {
        university: "n/a",
        courseMajor: "n/a",
        createdAt: new Date(),
        user,
      };
    }

    const stats = await getOverviewStats({ advisorUserId: userId });

    return {
      ...data,
      ...stats,
    };
  },
});
