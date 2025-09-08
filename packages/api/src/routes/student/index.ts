import { os } from "@orpc/server";

import { createStudent, CreateStudentInputSchema } from "./create";
import { listStudents } from "./lists";
import { searchStudents, SearchStudentsInputSchema } from "./search";

import { defaultMiddleware, privateRoute } from "../../utils/middleware";

export const studentCreateHandler = privateRoute
  .input(CreateStudentInputSchema)
  .handler(async ({ input }) => {
    const result = await createStudent(input);
    return result;
  });

export const studentListHandler = privateRoute.handler(async () => {
  const students = await listStudents();
  return students;
});

export const studentSearchHandler = privateRoute
  .input(SearchStudentsInputSchema)
  .handler(async ({ input }) => {
    const students = await searchStudents(input);
    return students;
  });
