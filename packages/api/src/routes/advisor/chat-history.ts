import { AuthContext } from "@/utils/middleware";
import { getAdvisorChatHistory } from "@student/db";

export const advisorChatHistory = async (ctx: AuthContext) => {
  const chats = await getAdvisorChatHistory({ advisorUserId: ctx.user.id });
  return chats;
};
