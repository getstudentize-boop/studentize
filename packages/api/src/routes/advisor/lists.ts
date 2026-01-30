import { getAdvisors } from "@student/db";
import { AuthContext } from "../../utils/middleware";

export const listAdvisors = async (ctx: AuthContext) => {
  const advisors = await getAdvisors(ctx.organizationId);
  return advisors;
};
