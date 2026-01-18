import { z } from "zod";
import { getUSCollegeStates, getUKCollegeLocations } from "@student/db";

export const GetFilterOptionsInputSchema = z.object({});

export type GetFilterOptionsInput = z.infer<
  typeof GetFilterOptionsInputSchema
>;

export const getFilterOptionsHandler = async () => {
  const [usStates, ukLocations] = await Promise.all([
    getUSCollegeStates(),
    getUKCollegeLocations(),
  ]);

  return {
    usStates,
    ukLocations,
    campusSettings: ["Urban", "Suburban", "Rural"],
    citySizes: ["Small", "Medium", "Large"],
  };
};
