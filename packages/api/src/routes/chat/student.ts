import { createNewChat } from "../../services/new-chat";
import { autoRag } from "../../utils/auto-rag";
import { openai } from "@ai-sdk/openai";
import { ORPCError, streamToEventIterator } from "@orpc/server";
import {
  createAdvisorChatMessage,
  getSessionSummaryById,
  getStudentSessionOverview,
} from "@student/db";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  TextPart,
  tool,
  UIMessage,
} from "ai";
import z from "zod";
import { AuthContext } from "@/utils/middleware";

export type ChatStudentInput = {
  studentUserId: string;
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
        ranking_options: { score_threshold: 0 },
        filter: {
          type: "and",
          filters: [{ type: "eq", key: "folder", value: input.studentId }],
        },
      });

      const sessionIds = response.result.data.map((item) => {
        const [_, sessionId] = item.filename.split("/");
        return sessionId.replace(".txt", "");
      });

      return {
        response: response.result.response,
        sessionIds,
      };
    },
  });
};

const createSessionOverviewTool = (input: { studentId: string }) => {
  return tool({
    description: "A tool that gets an overall overview of a student's session.",
    inputSchema: z.object({}),
    execute: async ({}) => {
      const overview = await getStudentSessionOverview(input.studentId);
      return overview?.sessionOverview ?? "";
    },
  });
};

const createSessionSummaryTool = (input: { studentId: string }) => {
  return tool({
    description: "A tool that gets the latest summary of a student's session.",
    inputSchema: z.object({ sessionId: z.string() }),
    execute: async ({ sessionId }) => {
      // todo-before-review: verify session belongs to student
      const sessionSummary = await getSessionSummaryById({ sessionId });
      return sessionSummary?.summary ?? "";
    },
  });
};

export const chatStudent = async (
  ctx: AuthContext,
  input: ChatStudentInput
) => {
  if (ctx.user.type === "STUDENT") {
    throw new ORPCError("FORBIDDEN");
  }

  const isNewMessage = input.messages.length === 1;

  const modelMessages = convertToModelMessages(input.messages);

  if (isNewMessage) {
    console.log("Creating new chat for student:", input.studentUserId);
    await createNewChat({
      advisorUserId: ctx.user.id,
      studentUserId: input.studentUserId,
      chatId: input.chatId,
      messages: modelMessages,
    });
  }

  const userMessage = modelMessages.at(-1)?.content as TextPart[];

  await createAdvisorChatMessage({
    chatId: input.chatId,
    content: userMessage.map((part) => part.text).join(""),
    role: "user",
  });

  const result = streamText({
    model: openai("gpt-5"),
    tools: {
      userTranscriptions: createTranscriptionTool({
        studentId: input.studentUserId,
      }),
      sessionOverview: createSessionOverviewTool({
        studentId: input.studentUserId,
      }),
      // sessionSummary: createSessionSummaryTool({
      //   studentId: input.studentUserId,
      // }),
    },
    system: `You are a helpful assistant for an advisor helping get information about their student. Use the tools to get information from the student's session transcriptions to help answer the user's questions. If you don't know the answer, just say you don't know. Do not make up an answer.`,
    messages: convertToModelMessages(input.messages),
    stopWhen: stepCountIs(5),
    onFinish: async (result) => {
      const message = result.response.messages.at(-1)
        ?.content as unknown as TextPart[];

      await createAdvisorChatMessage({
        chatId: input.chatId,
        content: message.map((part) => part.text).join(""),
        role: "assistant",
      });
    },
  });

  return streamToEventIterator(result.toUIMessageStream());
};
