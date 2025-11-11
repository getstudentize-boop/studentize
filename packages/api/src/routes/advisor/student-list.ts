import { createRouteHelper } from "../../utils/middleware";
import { getStudentList } from "@student/db";

export const getStudentListRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    const userId = ctx.user.id;
    const studentList = await getStudentList({
      advisorUserId: ctx.user.type === "ADMIN" ? undefined : userId,
    });

    return studentList;
  },
});
