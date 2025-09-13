import { createNewChat } from "../../services/new-chat";
import { autoRag } from "../../utils/auto-rag";
import { openai } from "@ai-sdk/openai";
import { ORPCError, streamToEventIterator } from "@orpc/server";
import {
  createAdvisorChatMessage,
  getSessionSummaryById,
  getStudentSessionOverview,
  getUserName,
  getStudentByUserId,
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

const createSearchSessionTranscriptions = (input: {
  studentUserId: string;
}) => {
  return tool({
    description:
      "Search through all of the student's session transcriptions to find relevant information based on a query. This tool performs semantic search across all recorded sessions and returns comprehensive information from actual conversations with the student.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "A specific question or topic to search for in the student's session transcriptions. Be specific about what information you're looking for (e.g., 'college application progress', 'discussion about career goals', 'feedback on essays')."
        ),
    }),
    execute: async ({ query }) => {
      const response = await autoRag(query, {
        ranking_options: { score_threshold: 0 },
        filter: {
          type: "and",
          filters: [{ type: "eq", key: "folder", value: input.studentUserId }],
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
    description:
      "Get a comprehensive overview of the student's entire session history and academic progress. This provides a high-level summary of all sessions, key themes, progress made, and overall development over time.",
    inputSchema: z.object({}),
    execute: async ({}) => {
      const overview = await getStudentSessionOverview(input.studentId);
      return overview?.sessionOverview ?? "";
    },
  });
};

const createSessionSummaryTool = (input: { studentId: string }) => {
  return tool({
    description:
      "Get a detailed summary of a specific session by its ID. Use this when you need more context about a particular session that was identified in search results or when an advisor asks about a specific session.",
    inputSchema: z.object({
      sessionId: z
        .string()
        .describe(
          "The specific session ID to get a summary for. This is typically obtained from searchSessionTranscriptions results or when an advisor references a particular session."
        ),
    }),
    execute: async ({ sessionId }) => {
      // todo-before-review: verify session belongs to student
      const sessionSummary = await getSessionSummaryById({ sessionId });
      return sessionSummary?.summary ?? "";
    },
  });
};

const createStudentInfoTool = (input: { studentUserId: string }) => {
  return tool({
    description:
      "Get comprehensive information about the student including their academic background, areas of interest, extracurricular activities, study curriculum, target countries, and other profile details. Use this to provide detailed context about the student's academic profile, interests, and background when advisors ask profile-related questions.",
    inputSchema: z.object({}),
    execute: async ({}) => {
      const student = await getStudentByUserId(input.studentUserId);
      if (!student) {
        return "No student information found.";
      }

      return {
        name: student.name,
        email: student.email,
        studyCurriculum: student.studyCurriculum,
        expectedGraduationYear: student.expectedGraduationYear,
        targetCountries: student.targetCountries,
        areasOfInterest: student.areasOfInterest,
        extracurricular: student.extracurricular,
      };
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

  const user = await getUserName(input.studentUserId);

  if (isNewMessage) {
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
      searchSessionTranscriptions: createSearchSessionTranscriptions({
        studentUserId: input.studentUserId,
      }),
      sessionOverview: createSessionOverviewTool({
        studentId: input.studentUserId,
      }),
      sessionSummary: createSessionSummaryTool({
        studentId: input.studentUserId,
      }),
      studentInfo: createStudentInfoTool({
        studentUserId: input.studentUserId,
      }),
    },
    system: `You are an AI copilot designed to help academic advisors quickly access and understand information about their students. Your role is to be helpful, efficient, and provide direct answers to advisor questions using the available tools.

**Student Name:** ${user?.name || "Unknown"}

**Available Tools:**

1. **searchSessionTranscriptions** - Search through all session transcriptions
   - PRIMARY source for most questions - contains the most current, up-to-date information
   - Use this for specific questions about topics, discussions, or events
   - Returns comprehensive answers based on actual conversations
   - Best for: "What did we discuss about college applications?" or "Has the student mentioned career interests?"

2. **sessionOverview** - Get overall student progress summary
   - Provides a high-level view of the student's entire journey
   - Shows key themes, progress, and development over time
   - Best for: "How is this student progressing overall?" or "What are the main areas we've been working on?"

3. **sessionSummary** - Get detailed summary of a specific session
   - Use session IDs from search results to get more context
   - Provides detailed information about what happened in that particular session
   - Best for: Getting deeper context about sessions found in search results

4. **studentInfo** - Get student profile information for background context
   - Provides static profile data: curriculum, interests, extracurriculars, target countries
   - Use primarily for background context, NOT as the primary answer source
   - Session data is more current and should take priority over profile data
   - Best for: Adding context after getting current information from sessions

**Your Approach as a Copilot:**
- **ALWAYS start with searchTranscriptions**: This has the most current, up-to-date information from actual conversations
- **Profile data is background context only**: Use studentInfo to add context, never as the primary answer
- **Current conversations > Static profile**: Session discussions reflect current plans and should take priority
- **Structure your responses**: Use clear sections like "Short answer:", "Details:", and "Context:" when appropriate
- **Be thorough and actionable**: Provide specific details from sessions, concrete examples, and practical insights
- **Connect the dots**: Show how current plans (from sessions) compare to or differ from profile interests
- **End with helpful guidance**: Suggest relevant follow-up questions or areas the advisor might want to explore
- **Never mention session IDs**: Keep responses conversational and avoid technical references

**Tool Selection Priority:**
1. **searchSessionTranscriptions** - Primary tool for most questions to get current discussions and plans
2. **studentInfo** - For profile context, often used together with session search
3. **sessionOverview** - For overall progress and journey questions
4. **sessionSummary** - Only when you need additional context from specific sessions

**Response Structure (when appropriate):**
- **Short answer**: Brief direct response
- **Details**: Specific information from sessions (quotes, concrete plans, decisions)
- **Context**: How this relates to their profile, interests, or overall journey
- **Optional guidance**: Relevant follow-up areas or questions for the advisor

**Simple Approach:**
- **ALL questions** → Start with searchTranscriptions to get current, up-to-date information
- **Then add context** → Use studentInfo only to provide background context or show differences
- **Current plans trump profile** → If sessions show different interests than profile, prioritize session data
- **Progress questions** → Use sessionOverview for big picture view
- **Need more context** → Then use sessionSummary

Always prioritize what the student has discussed recently in sessions over static profile information. Sessions contain their current thinking and plans.

Provide comprehensive, structured responses that give advisors actionable insights and practical next steps. Combine multiple tools to paint a complete picture of the student's current situation and plans.`,
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
