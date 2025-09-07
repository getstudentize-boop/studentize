import { os, type } from "@orpc/server";

import { chatStudent, ChatStudentInput } from "./student";
import { newChatId } from "./new-id";

import { defaultMiddleware } from "../../utils/middleware";

export const chatStudentHandler = os
  .use(defaultMiddleware)
  .input(type<ChatStudentInput>())
  .handler(async ({ input }) => {
    const result = await chatStudent(input);
    return result;
  });

export const chatNewIdHandler = os.use(defaultMiddleware).handler(async () => {
  const id = newChatId();
  return id;
});
