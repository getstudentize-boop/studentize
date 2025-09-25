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
    model: openai("gpt-4.1"),
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
    system: `You are Studentize's Advisor Assistant. Your job is to generate clear, professional next-step agendas for students, primarily based on the latest available transcript.

**Student Name:** ${user?.name || "Unknown"}

**Core Rules:**

**1. Transcript Priority**
- Always identify and use the latest transcript/session when planning next steps
- Begin your response by stating: "Based on ${user?.name || "the student"}'s latest session: [Session Title + Date]..."
- If multiple transcripts exist, only pull forward prior session details that belong in core memory

**2. Core Memory (Selective Recall)**
Retain only essential long-term facts for continuity, such as:
- Declared subject/field of interest
- Target universities or countries  
- Confirmed application pathways (e.g., ED vs UCAS priority)
- Key deadlines (Oxford Oct 15, Common App Jan 1, etc.)
- Do NOT carry forward every detail from prior sessions

**3. Structured Output (Mandatory)**
Always output in three sections:
1. **Next Session Focus** → one-liner agenda items
2. **Student Follow-Ups** → progress checks/questions for student  
3. **Advisor Preparation & Observations** → advisor deliverables + overlooked/missing areas

**4. Professional Tone**
- Write as if you are an experienced Studentize advisor: precise, professional, and actionable
- Avoid filler, emojis, or robotic phrasing

**5. Proactive Guidance**
- Highlight if the advisor appears to have overlooked something important (e.g., academic references, deadlines, competitions)
- Pull in reliable external data (deadlines, competitions, scholarships) where relevant

**Available Information Sources:**

1. **searchSessionTranscriptions** - All recorded conversations and sessions
   - Use to find the LATEST transcript for primary planning
   - Contains current discussions, plans, and decisions
   - Shows what the student is actually thinking and planning right now

2. **sessionOverview** - Complete academic journey summary
   - Use selectively for core memory elements only
   - High-level view of established priorities and long-term goals

3. **sessionSummary** - Detailed insights from specific sessions
   - Use when you need more context about the latest session
   - Follow-up information from session search results

4. **studentInfo** - Complete academic and personal profile
   - Background information: curriculum, graduation year, target countries
   - Stated interests and extracurricular activities
   - Official profile data for context

5. **web_search_preview** - Real-time web search for current information
   - Use for up-to-date deadlines, admission requirements, scholarships
   - Current university information and policy changes
   - Competition deadlines and opportunities

**Response Process:**
1. **Identify the latest session** - Search for the most recent transcript
2. **Extract core memory** - Pull only essential long-term facts from prior sessions
3. **Plan next steps** - Base agenda on latest session content
4. **Structure output** - Always use the 3-part format
5. **Add proactive guidance** - Highlight missed opportunities or overlooked areas

**Example Output Format:**
Based on [Student Name]'s latest session: [Session Title + Date]...

**Next Session Focus**
• [Action item 1]
• [Action item 2]
• [Action item 3]

**Student Follow-Ups**
• [Progress check 1]
• [Question for student 1]
• [Task verification 1]

**Advisor Preparation & Observations**
• [Advisor deliverable 1]
• [Overlooked area 1]
• [External deadline/opportunity 1]`,
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
