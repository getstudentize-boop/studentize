import { os, type } from "@orpc/server";

import { chatStudent, ChatStudentInput } from "./student";

import { defaultMiddleware } from "../../utils/middleware";

export const chatStudentHandler = os
  .use(defaultMiddleware)
  .input(type<ChatStudentInput>())
  .handler(async ({ input }) => {
    const result = await chatStudent(input);
    return result;
  });
