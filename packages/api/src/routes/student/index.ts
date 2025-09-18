import { createStudent, CreateStudentInputSchema } from "./create";
import { listStudents, ListStudentsInputSchema } from "./lists";
import { searchStudents, SearchStudentsInputSchema } from "./search";
import { getOneStudent, GetOneStudentInputSchema } from "./get-one";
import { updateStudent, UpdateStudentInputSchema } from "./update";
import {
  updateSettings,
  StudentUpdateSettingsInputSchema,
} from "./update-settings";

import { privateRoute } from "../../utils/middleware";

const studentCreateHandler = privateRoute
  .input(CreateStudentInputSchema)
  .handler(async ({ input }) => {
    const result = await createStudent(input);
    return result;
  });

const studentListHandler = privateRoute
  .input(ListStudentsInputSchema)
  .handler(async ({ context, input }) => {
    const students = await listStudents(context, input);
    return students;
  });

const studentSearchHandler = privateRoute
  .input(SearchStudentsInputSchema)
  .handler(async ({ input, context }) => {
    const students = await searchStudents(context, input);
    return students;
  });

const studentGetOneHandler = privateRoute
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

const studentUpdateHandler = privateRoute
  .input(UpdateStudentInputSchema)
  .handler(async ({ context, input }) => {
    const result = await updateStudent(context, input);
    return result;
  });

const studentUpdateSettingsHandler = privateRoute
  .input(StudentUpdateSettingsInputSchema)
  .handler(async ({ context, input }) => {
    const result = await updateSettings(context, input);
    return result;
  });

export const student = {
  create: studentCreateHandler,
  list: studentListHandler,
  search: studentSearchHandler,
  getOne: studentGetOneHandler,
  update: studentUpdateHandler,
  updateSettings: studentUpdateSettingsHandler,
};
