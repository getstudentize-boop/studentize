import { openai } from "@ai-sdk/openai";
import { streamToEventIterator } from "@orpc/server";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export type ChatStudentInput = {
  studentUserId: string;
  advisorUserId: string;
  messages: UIMessage[];
};

export const chatStudent = (input: ChatStudentInput) => {
  const result = streamText({
    model: openai("gpt-4.1"),
    system: `You are a helpful assistant for a student. You are having a conversation with the student and their advisor. You should answer the student's questions and help them with their studies. You should also be polite and respectful to both the student and the advisor. If you don't know the answer to a question, you should say "I don't know" or "I'm not sure".`,
    messages: convertToModelMessages(input.messages),
  });

  return streamToEventIterator(result.toUIMessageStream());
};
