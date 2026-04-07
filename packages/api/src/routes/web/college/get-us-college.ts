import { z } from "zod";
import { getUSCollegeById } from "@student/db";
import { transformUSCollege } from "./transform";

export const GetUSCollegeInputSchema = z.object({
  id: z.string(),
});

export type GetUSCollegeInput = z.infer<typeof GetUSCollegeInputSchema>;

export const getUSCollegeHandler = async (input: GetUSCollegeInput) => {
  const college = await getUSCollegeById(input.id);

  if (!college) {
    throw new Error("College not found");
  }

  return transformUSCollege(college);
};
