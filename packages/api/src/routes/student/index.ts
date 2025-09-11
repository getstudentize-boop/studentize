import { os } from "@orpc/server";

import { createStudent, CreateStudentInputSchema } from "./create";
import { listStudents, ListStudentsInputSchema } from "./lists";
import { searchStudents, SearchStudentsInputSchema } from "./search";

import { privateRoute } from "../../utils/middleware";

export const studentCreateHandler = privateRoute
  .input(CreateStudentInputSchema)
  .handler(async ({ input }) => {
    const result = await createStudent(input);
    return result;
  });

export const studentListHandler = privateRoute
  .input(ListStudentsInputSchema)
  .handler(async ({ context, input }) => {
    const students = await listStudents(context, input);
    return students;
  });

export const studentSearchHandler = privateRoute
  .input(SearchStudentsInputSchema)
  .handler(async ({ input }) => {
    const students = await searchStudents(input);
    return students;
  });
