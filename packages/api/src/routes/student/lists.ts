import { getStudents } from "@student/db";

export const listStudents = async () => {
  const students = await getStudents();
  return students;
};
