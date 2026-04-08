import { z } from "zod";
import { getUKCollegeById } from "@student/db";
import { transformUKCollegeDetail } from "./transform";
import { enrichUKCollege } from "../../../services/enrich-uk-college";

export const GetUKCollegeInputSchema = z.object({
  id: z.string(),
});

export type GetUKCollegeInput = z.infer<typeof GetUKCollegeInputSchema>;

export const getUKCollegeHandler = async (input: GetUKCollegeInput) => {
  const college = await getUKCollegeById(input.id);

  if (!college) {
    throw new Error("College not found");
  }

  // Already enriched — return immediately, no extra DB calls
  if (college.enrichedAt) {
    return transformUKCollegeDetail(college);
  }

  // Not enriched yet — call LLM, persist, then return
  const enriched = await enrichUKCollege(college);
  return transformUKCollegeDetail(enriched);
};
