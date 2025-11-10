import { getOverviewByUserId, getOverviewStats } from "@student/db";

import { createRouteHelper } from "../../utils/middleware";

export const getOverviewRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    const userId = ctx.user.id;

    const data = await getOverviewByUserId({ advisorUserId: userId });
    const stats = await getOverviewStats({ advisorUserId: userId });

    return {
      ...data,
      ...stats,
    };
  },
});
