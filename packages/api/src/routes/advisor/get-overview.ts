import {
  getOverviewByUserId,
  getOverviewStats,
  getUserName,
} from "@student/db";

import { createRouteHelper } from "../../utils/middleware";

export const getOverviewRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    const userId = ctx.user.id;

    let data = await getOverviewByUserId({ advisorUserId: userId });

    if (ctx.user.type === "ADMIN") {
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
      advisorUserId: ctx.user.type === "ADMIN" ? undefined : userId,
    });

    return {
      ...data,
      ...stats,
    };
  },
});
