import { z } from "zod";
import { searchUKColleges, type UKCollegeFilters } from "@student/db";

export const SearchUKCollegesInputSchema = z.object({
  search: z.string().optional(),
  locations: z.array(z.string()).optional(),
  maxTuition: z.number().min(0).optional(),
  citySize: z.array(z.string()).optional(),
  sortBy: z.enum(["name", "tuition", "ranking"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

export type SearchUKCollegesInput = z.infer<
  typeof SearchUKCollegesInputSchema
>;

export const searchUKCollegesHandler = async (
  input: SearchUKCollegesInput
) => {
  const filters: UKCollegeFilters = {
    ...input,
  };

  const result = await searchUKColleges(filters);
  return result;
};
