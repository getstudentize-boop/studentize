import { getAdvisors } from "@student/db";

export const listAdvisors = async () => {
  const advisors = await getAdvisors();
  return advisors;
};
