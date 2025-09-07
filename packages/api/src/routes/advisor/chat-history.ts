import { getAdvisorChatHistory } from "@student/db";

export const advisorChatHistory = async () => {
  const chats = await getAdvisorChatHistory();
  return chats;
};
