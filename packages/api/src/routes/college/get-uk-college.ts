import { z } from "zod";
import { getUKCollegeById } from "@student/db";
import { transformUKCollegeDetail } from "./transform";
import { enrichUKCollege } from "../../services/enrich-uk-college";

export const GetUKCollegeInputSchema = z.object({
  id: z.string(),
});

export type GetUKCollegeInput = z.infer<typeof GetUKCollegeInputSchema>;

export const getUKCollegeHandler = async (input: GetUKCollegeInput) => {
  const college = await getUKCollegeById(input.id);

  if (!college) {
    throw new Error("College not found");
  }

  const enriched = await enrichUKCollege(college);

  return transformUKCollegeDetail(enriched);
};
