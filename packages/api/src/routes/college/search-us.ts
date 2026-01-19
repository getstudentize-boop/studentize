import { z } from "zod";
import { searchUSColleges, type USCollegeFilters } from "@student/db";

export const SearchUSCollegesInputSchema = z.object({
  search: z.string().optional(),
  states: z.array(z.string()).optional(),
  minAdmissionRate: z.number().min(0).max(1).optional(),
  maxAdmissionRate: z.number().min(0).max(1).optional(),
  minSATScore: z.number().min(400).max(1600).optional(),
  maxSATScore: z.number().min(400).max(1600).optional(),
  maxTuition: z.number().min(0).optional(),
  campusSetting: z.array(z.string()).optional(),
  sortBy: z
    .enum(["name", "admission_rate", "sat_score", "tuition", "ranking"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

export type SearchUSCollegesInput = z.infer<
  typeof SearchUSCollegesInputSchema
>;

export const searchUSCollegesHandler = async (
  input: SearchUSCollegesInput
) => {
  const filters: USCollegeFilters = {
    ...input,
  };

  const result = await searchUSColleges(filters);
  return result;
};
