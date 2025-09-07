import { convertMessageToContent } from "../../utils/chat";
import { createNewChat } from "../../services/new-chat";
import { autoRag } from "../../utils/auto-rag";
import { openai } from "@ai-sdk/openai";
import { streamToEventIterator } from "@orpc/server";
import { createAdvisorChatMessage } from "@student/db";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  TextPart,
  tool,
  UIMessage,
} from "ai";
import z from "zod";

export type ChatStudentInput = {
  studentUserId: string;
  advisorUserId: string;
  chatId: string;
  messages: UIMessage[];
};

const createTranscriptionTool = (input: { studentId: string }) => {
  return tool({
    description:
      "A tool get information from a student's session transcriptions.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("The question to ask about the student's transcriptions."),
    }),
    execute: async ({ query }) => {
      const response = await autoRag(query, {
        filter: {
          type: "and",
          filters: [{ type: "eq", key: "folder", value: input.studentId }],
        },
      });

      return response.result.response;
    },
  });
};

export const chatStudent = async (input: ChatStudentInput) => {
  const isNewMessage = input.messages.length === 1;

  const modelMessages = convertToModelMessages(input.messages);

  if (isNewMessage) {
    await createNewChat({
      advisorUserId: input.advisorUserId,
      studentUserId: input.studentUserId,
      chatId: input.chatId,
      messages: modelMessages,
    });
  }

  console.log("💡:", modelMessages);

  const userMessage = modelMessages.at(-1)?.content as TextPart[];

  console.log("🔥:", userMessage);

  await createAdvisorChatMessage({
    chatId: input.chatId,
    content: userMessage.map((part) => part.text).join(""),
    role: "user",
  });

  const result = streamText({
    model: openai("gpt-4.1"),
    tools: {
      userTranscriptions: createTranscriptionTool({
        studentId: input.studentUserId,
      }),
    },
    system: `You are a helpful assistant for an advisor helping get information about their student. Use the tools to get information from the student's session transcriptions to help answer the user's questions. If you don't know the answer, just say you don't know. Do not make up an answer.`,
    messages: convertToModelMessages(input.messages),
    stopWhen: stepCountIs(5),
    onFinish: async (result) => {
      const message = result.response.messages.at(-1)
        ?.content as unknown as TextPart[];

      console.log("💬:", message);

      await createAdvisorChatMessage({
        chatId: input.chatId,
        content: message.map((part) => part.text).join(""),
        role: "assistant",
      });
    },
  });

  return streamToEventIterator(result.toUIMessageStream());
};
