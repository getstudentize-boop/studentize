import { z } from "zod";
import {
  getUSCollegeStates,
  getUKCollegeLocations,
  getUSCollegeCampusSettings,
  getUKCollegeCitySizes,
} from "@student/db";

export const GetFilterOptionsInputSchema = z.object({});

export type GetFilterOptionsInput = z.infer<
  typeof GetFilterOptionsInputSchema
>;

export const getFilterOptionsHandler = async () => {
  const [usStates, ukLocations, campusSettings, citySizes] = await Promise.all([
    getUSCollegeStates(),
    getUKCollegeLocations(),
    getUSCollegeCampusSettings(),
    getUKCollegeCitySizes(),
  ]);

  return {
    usStates,
    ukLocations,
    campusSettings,
    citySizes,
  };
};
