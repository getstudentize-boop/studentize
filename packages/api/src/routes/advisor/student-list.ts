import { createRouteHelper } from "../../utils/middleware";
import { getStudentList } from "@student/db";

export const getStudentListRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    const userId = ctx.user.id;
    const isAdmin = ["OWNER", "ADMIN"].includes(ctx.user.organization.role);
    const studentList = await getStudentList({
      advisorUserId: isAdmin ? undefined : userId,
      organizationId: isAdmin ? ctx.organizationId : undefined,
    });

    return studentList;
  },
});
