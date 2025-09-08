import { AuthContext } from "../../utils/middleware";

export const getCurrentUser = async (ctx: AuthContext) => {
  return ctx.user;
};
