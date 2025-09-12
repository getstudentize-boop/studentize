import { createStudent, CreateStudentInputSchema } from "./create";
import { listStudents, ListStudentsInputSchema } from "./lists";
import { searchStudents, SearchStudentsInputSchema } from "./search";
import { getOneStudent, GetOneStudentInputSchema } from "./get-one";
import { updateStudent, UpdateStudentInputSchema } from "./update";

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
  .handler(async ({ input, context }) => {
    const students = await searchStudents(context, input);
    return students;
  });

export const studentGetOneHandler = privateRoute
  .input(GetOneStudentInputSchema)
  .handler(async ({ context, input }) => {
    try {
      const student = await getOneStudent(context, input);
      return student;
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

export const studentUpdateHandler = privateRoute
  .input(UpdateStudentInputSchema)
  .handler(async ({ context, input }) => {
    const result = await updateStudent(context, input);
    return result;
  });
