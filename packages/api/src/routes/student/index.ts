import { os } from "@orpc/server";

import { createStudent, CreateStudentInputSchema } from "./create";
import { listStudents } from "./lists";
import { searchStudents, SearchStudentsInputSchema } from "./search";

import { defaultMiddleware } from "../../utils/middleware";

export const studentCreateHandler = os
  .use(defaultMiddleware)
  .input(CreateStudentInputSchema)
  .handler(async ({ input }) => {
    const result = await createStudent(input);
    return result;
  });

export const studentListHandler = os
  .use(defaultMiddleware)
  .handler(async () => {
    const students = await listStudents();
    return students;
  });

export const studentSearchHandler = os
  .use(defaultMiddleware)
  .input(SearchStudentsInputSchema)
  .handler(async ({ input }) => {
    const students = await searchStudents(input);
    return students;
  });
