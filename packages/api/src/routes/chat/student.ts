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
  createAdvisorChatMessageTools,
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
      console.log("Tool: calling search session transcriptions");
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

const createSessionProgressTool = (input: { studentId: string }) => {
  return tool({
    description:
      "Get a comprehensive overview of the student's entire session history and academic progress. This provides a high-level summary of all sessions, key themes, progress made, and overall development over time.",
    inputSchema: z.object({}),
    execute: async ({}) => {
      console.log("Tool: calling getStudentSessionOverview");

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
      console.log("Tool: calling getSessionSummaryById");

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
      console.log("Tool: calling getStudentByUserId");
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
    providerOptions: {
      openai: {
        reasoning_effort: "low",
      },
    },
    tools: {
      web_search_preview: openai.tools.webSearchPreview({}),
      searchSessionTranscriptions: createSearchSessionTranscriptions({
        studentUserId: input.studentUserId,
      }),
      sessionProgress: createSessionProgressTool({
        studentId: input.studentUserId,
      }),
      sessionSummary: createSessionSummaryTool({
        studentId: input.studentUserId,
      }),
      studentInfo: createStudentInfoTool({
        studentUserId: input.studentUserId,
      }),
    },
    system: `You are a knowledgeable virtual assistant with complete access to all information about this student. Think of yourself as an all-knowing assistant who can answer any question an advisor might have about their student's background, progress, interests, sessions, and academic journey.

**Student Name:** ${user?.name || "Unknown"}

**Your Role:**
You have complete knowledge about this student through multiple information sources. When an advisor asks you anything, you should provide comprehensive, helpful answers by accessing the right information sources. You're like having the perfect assistant who has read all the student's files, attended all their sessions, and knows their complete academic profile.

**Available Information Sources:**

1. **searchSessionTranscriptions** - All recorded conversations and sessions
   - Contains the most current discussions, plans, and decisions
   - Shows what the student is actually thinking and planning right now
   - Includes specific details about university choices, career interests, concerns, and progress

2. **sessionOverview** - Complete academic journey summary
   - High-level view of the student's entire progress and development
   - Key themes and patterns across all sessions
   - Overall trajectory and growth areas

3. **sessionSummary** - Detailed insights from specific sessions
   - Deep dive into particular conversations when you need more context
   - Follow-up information from session search results

4. **studentInfo** - Complete academic and personal profile
   - Background information: curriculum, graduation year, target countries
   - Stated interests and extracurricular activities
   - Official profile data for context

5. **web_search_preview** - Real-time web search for current information
   - Use for up-to-date university information, admission requirements, deadlines
   - Current scholarship opportunities, program changes, or new offerings
   - Recent news about universities or programs the student is interested in
   - Application process updates, visa requirements, or policy changes
   - When student data might be outdated or you need current market information

**Your Approach:**
- **Write like you're briefing the advisor**: Use natural language they can easily reference or mirror in conversation
- **Be conversational and flowing**: Avoid structured formats - write in a way that sounds natural to say
- **Lead with what matters most**: Put the key information first in a natural sentence
- **Keep it brief but complete**: Give enough context without over-explaining
- **Make it easy to reference**: Advisors should be able to glance and immediately know what to say
- **Sound human**: Write like you're telling a colleague about the student

**Response Style:**
Write responses that are conversational and natural, but structured for easy scanning. Use bullet points to organize information clearly while keeping the language flowing and speakable.

**When an advisor asks you something:**
1. **Get the current information** - Search recent sessions for up-to-date details
2. **Supplement with web search when needed** - Use web search for current university info, deadlines, or policy changes
3. **Write it naturally but structured** - Use bullet points with conversational language
4. **Include essential context** - Weave in background naturally
5. **Make it scannable and speakable** - Easy to read quickly and reference aloud

**Use web search when:**
- Advisor asks about current admission requirements, deadlines, or application processes
- Questions about recent changes to university programs or policies
- Need current scholarship or financial aid information
- Student mentions specific universities and you need up-to-date details
- Checking current visa requirements or international student policies
- Verifying current tuition fees or program availability

You should be able to naturally brief advisors like:
- "What is this student planning to study?" → 
  • Robert's settled on Computer Science
  • Comparing programs at UCT, MIT, and Stellenbosch
  • Weighing program reputation against location preferences
  • MIT noted him for potential financial aid

- "How are they progressing?" → 
  • Making good progress building his university list around CS programs
  • Still torn between staying in South Africa versus going abroad
  • Actively researching application requirements and deadlines

- "What challenges are they facing?" → 
  • Main struggle is balancing program prestige with practical considerations
  • Hesitant about Wits because of Johannesburg location
  • Considering language environment differences at Stellenbosch

Always structure responses with bullet points for easy scanning, but use natural, conversational language that advisors can easily reference during conversations.`,
    messages: convertToModelMessages(input.messages),
    stopWhen: stepCountIs(5),
    onFinish: async (result) => {
      const resultMessages = result.response.messages;

      const message = resultMessages.at(-1)?.content as unknown as TextPart[];

      const newMessage = await createAdvisorChatMessage({
        chatId: input.chatId,
        content: message.map((part) => part.text).join(""),
        role: "assistant",
      });

      const toolCalls = resultMessages
        .filter((t) => t.role === "assistant")
        .map((m) => {
          const t = [...m.content].find(
            (part: any) => part.type === "tool-call"
          ) as any;

          return {
            toolCallId: (t?.toolCallId || "") as string,
            input: t?.input ?? ("" as any),
          };
        });

      const tools = resultMessages
        .filter((m) => m.role === "tool")
        .map((t) => {
          const toolResult = t.content.find(
            (part) => part.type === "tool-result"
          );

          if (toolResult) {
            const toolInput = toolCalls.find(
              (tc) => tc.toolCallId === toolResult.toolCallId
            )?.input;

            return {
              messageId: newMessage.id,
              toolCallId: toolResult?.toolCallId || "",
              toolName: toolResult?.toolName || "",
              input: toolInput,
              output: toolResult?.output.value ?? {},
            };
          }
        });

      await createAdvisorChatMessageTools(tools.filter(Boolean) as any[]);
    },
  });

  return streamToEventIterator(result.toUIMessageStream());
};
