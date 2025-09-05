import z from "zod";

import { searchUserByName } from "@student/db";

export const SearchAdvisorsInputSchema = z.object({
  query: z.string().min(2),
});

export const searchAdvisors = async (
  data: z.infer<typeof SearchAdvisorsInputSchema>
) => {
  const advisors = await searchUserByName({
    query: data.query,
    type: "ADVISOR",
  });

  return advisors;
};
