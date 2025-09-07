import { ModelMessage, generateObject } from "ai";

import { createAdvisorChat } from "@student/db";

import z from "zod";

import { openai } from "../utils/openai";

export const createNewChat = async (input: {
  studentUserId: string;
  advisorUserId: string;
  chatId: string;
  messages: ModelMessage[];
}) => {
  const { object } = await generateObject({
    model: openai("gpt-4.1-mini"),
    schema: z.object({
      title: z.string(),
    }),
    messages: input.messages,
    system: "Generate a short title for this chat.",
  });

  await createAdvisorChat({
    chatId: input.chatId,
    title: object.title,
    userId: input.advisorUserId,
    studentId: input.studentUserId,
  });

  return { title: object.title };
};
