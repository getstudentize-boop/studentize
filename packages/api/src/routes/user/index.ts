import { os } from "@orpc/server";

import { createStudent, CreateStudentInputSchema } from "./create-student";

import { defaultMiddleware } from "../../utils/middleware";

export const userCreateStudentHandler = os
  .use(defaultMiddleware)
  .input(CreateStudentInputSchema)
  .handler(async ({ input }) => {
    const result = await createStudent(input);
    return result;
  });
