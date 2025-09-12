import { type } from "@orpc/server";

import { chatStudent, ChatStudentInput } from "./student";
import { newChatId } from "./new-id";

import { privateRoute } from "../../utils/middleware";

export const chatStudentHandler = privateRoute
  .input(type<ChatStudentInput>())
  .handler(async ({ context, input }) => {
    const result = await chatStudent(context, input);
    return result;
  });

export const chatNewIdHandler = privateRoute.handler(async () => {
  const id = newChatId();
  return id;
});
