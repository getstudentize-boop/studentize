import z from "zod";

import { searchUserByName } from "@student/db";

export const SearchStudentsInputSchema = z.object({
  query: z.string().min(2),
});

export const searchStudents = async (
  data: z.infer<typeof SearchStudentsInputSchema>
) => {
  const students = await searchUserByName({
    query: data.query,
    type: "STUDENT",
  });

  return students;
};
