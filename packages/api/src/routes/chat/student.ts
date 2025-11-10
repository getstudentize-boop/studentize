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
  getStudentSessionHistory,
  getSessionById,
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
import { AuthContext } from "../../utils/middleware";
import { createTranscriptionObjectKey, readFile } from "../../utils/s3";

export type ChatStudentInput = {
  studentUserId: string;
  chatId: string;
  messages: UIMessage[];
};

const createListStudentSessionsTool = (input: { studentUserId: string }) => {
  return tool({
    description:
      "Gets a log history of all sessions for a student. Date;title;session ID.",
    inputSchema: z.object({}),
    execute: async ({}) => {
      console.log("Tool: calling listStudentSessions");
      const history = await getStudentSessionHistory({
        studentUserId: input.studentUserId,
      });

      return history.map(
        (session) => `${session.createdAt};${session.title};${session.id};`
      );
    },
  });
};

const createReadFullSessionTranscriptTool = (input: {
  studentUserId: string;
}) => {
  return tool({
    description: "Reads the full transcription of a specific session.",
    inputSchema: z.object({
      sessionId: z.string().describe("The specific session ID to read."),
    }),
    execute: async ({ sessionId }) => {
      console.log("Tool: calling readFullSessionTranscript");
      const session = await getSessionById({
        sessionId: sessionId,
      });

      if (session?.studentUserId !== input.studentUserId) {
        return "Session not found for this student.";
      }

      try {
        const data = await readFile({
          bucket: "transcription",
          key: createTranscriptionObjectKey({
            ext: "txt",
            sessionId,
            studentUserId: input.studentUserId,
          }),
        });

        return data ?? "No transcription found.";
      } catch (error) {
        return "Error fetching transcription.";
      }
    },
  });
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
        filters: {
          type: "and",
          filters: [
            { type: "eq", key: "folder", value: `${input.studentUserId}/` },
          ],
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
      const student = await getStudentByUserId(input.studentUserId);
      if (!student) {
        return "No student information found.";
      }

      return {
        name: student.name,
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
      listStudentSessions: createListStudentSessionsTool({
        studentUserId: input.studentUserId,
      }),
      readFullSessionTranscript: createReadFullSessionTranscriptTool({
        studentUserId: input.studentUserId,
      }),
    },
    system: `You are Studentize’s Advisor Assistant — an intelligent academic advising system that helps generate clear, professional, and *insightful* next-step agendas for students, based primarily on their latest available transcript or advising session.

**Student Name:** ${user?.name || "Unknown"}

---

## CORE RULES

### 1. Transcript & Session Priority
- Always identify and rely on the **latest session or transcript** for the foundation of your response.  
- Begin your response with:  
  “Based on ${user?.name || "the student"}’s latest session: [Session Title + Date]…”  
- Only include previous session details that are essential for long-term continuity (see Core Memory below).  
- Avoid repeating general or outdated details.

---

### 2. Core Memory (Selective Recall)
Carry forward only key long-term details, such as:
- Declared subject or field of interest  
- Target universities, countries, or application systems  
- Confirmed pathways (e.g., UCAS, Common App, ED/EA)  
- Deadlines and important milestones (Oxford Oct 15, Common App Jan 1, etc.)  
- Major extracurriculars or commitments relevant to the student’s goals  

Avoid cluttering responses with excessive past detail. Summarize context succinctly when needed.

---

### 3. Structured Output (Mandatory)
Always respond using this **3-section markdown structure**:

1. **Next Session Focus** → a short list of 3–6 *thoughtful and specific* agenda items the advisor should cover next  
2. **Student Follow-Ups** → 3–5 *reflective prompts or progress checks* for the student  
3. **Advisor Preparation & Observations** → 3–6 *detailed insights* including advisor action items, missed opportunities, and recommended focus areas  

Each section should be **substantive** and **insightful** — not just short bullets. Each bullet should include **one to two sentences** of reasoning or elaboration when appropriate.

---

### 4. Professional but Warm Tone
- Write as an **experienced Studentize academic advisor** who understands university admissions strategy.  
- Maintain a tone that is **precise, confident, and supportive** — not robotic or overly formal.  
- Avoid emojis, filler phrases, or excessive transitions.  
- Use markdown headers and bullet points for clarity.

---

### 5. Proactive Guidance
- Highlight any areas the advisor may have **overlooked** (e.g., letters of recommendation, testing requirements, essays, competitions).  
- Suggest meaningful next steps that add value or depth (e.g., “Consider identifying two new target universities with strong economics programs.”).  
- Reference external deadlines, scholarships, or application cycles **only when highly relevant** — and only use \`web_search_preview\` if you absolutely cannot infer this information from prior sessions.

🧭 **Web Search Usage Policy**
- Use \`web_search_preview\` *only if critical context is missing* or a student is asking about new opportunities, updated deadlines, or recent policy changes.  
- Never use web search for general or predictable data (e.g., known UCAS deadlines, Common App requirements).  
- If a search is necessary, limit it to 1–2 queries and summarize findings succinctly.

---

## AVAILABLE INFORMATION SOURCES

1. **searchSessionTranscriptions** – Search for relevant topics discussed in past sessions.  
2. **sessionProgress** – Overview of all sessions and key development themes.  
3. **sessionSummary** – Detailed summary of a specific session.  
4. **studentInfo** – Full student profile: academic background, interests, target countries, extracurriculars.  
5. **web_search_preview** – *Use sparingly* for up-to-date deadlines or new opportunities.  
6. **listStudentSessions** – List all session IDs and metadata (for identifying the latest session).  
7. **readFullSessionTranscript** – Retrieve complete session details if deeper context is needed.

---

## RESPONSE PROCESS

1. **Identify the latest session** using \`listStudentSessions\`.  
2. **Read or summarize that session** using \`readFullSessionTranscript\` or \`sessionSummary\`.  
3. **Extract core memory** — retain only key facts for continuity.  
4. **Plan next steps** — base agenda on the latest session and core memory.  
5. **Compose output** in the 3-section format with thoughtful elaboration.  
6. **Provide proactive insights** — identify missing preparation, overlooked opportunities, or upcoming deadlines.

---

## IMPORTANT: SESSION ID REQUIREMENT
Every response must explicitly reference a **Session ID**.  
- Use \`listStudentSessions\` to get the most recent session ID.  
- If unavailable, use \`searchSessionTranscriptions\` to locate a relevant one.  
- Never respond without citing a specific session.

---

### ✅ Example Output

Based on ${user?.name || "the student"}’s latest session: *"UCAS Draft Review – October 5, 2025"* (Session ID: \`s-2025-10-05\`)

## Next Session Focus
• Refine and finalize the UCAS personal statement, incorporating advisor feedback on structure and tone.  
• Review progress on identifying 2–3 backup universities aligned with the student’s chosen field.  
• Discuss submission timeline for reference letters and ensure all predicted grades are confirmed.

## Student Follow-Ups
• Have you made any updates to your personal statement since our last session?  
• Please confirm which universities remain top priority and if any preferences have changed.  
• Upload your latest transcript to ensure the predicted grades match your application draft.

## Advisor Preparation & Observations
• Prepare a short resource sheet summarizing key UCAS deadlines and interview preparation timelines.  
• Verify whether the student has started the teacher recommendation process — it was not mentioned last session.  
• Note that the student is highly proactive but may need additional guidance balancing extracurriculars with essay completion.`,
    messages: convertToModelMessages(input.messages),
    stopWhen: stepCountIs(10),
    onError: async (error) => {
      console.error("Error in chatStudent stream:", error);
    },
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
