import { openai } from "@ai-sdk/openai";
import { streamToEventIterator } from "@orpc/server";
import {
  createVisitorChat,
  createVisitorChatMessage,
  updateVisitorChatTitle,
} from "@student/db";
import {
  convertToModelMessages,
  streamText,
  TextPart,
  UIMessage,
  generateObject,
} from "ai";
import z from "zod";

export type VisitorChatInput = {
  chatId: string;
  fullName: string;
  email: string;
  phone: string;
  messages: UIMessage[];
};

const visitorChatPrompt = (visitor: { fullName: string }) => {
  return `You are Studentize's Virtual Advisor — a friendly, knowledgeable assistant that helps prospective students and their families learn about Studentize's services and university admissions guidance.

**Visitor Name:** ${visitor.fullName}

---

## WHO YOU ARE

You represent **Studentize**, a platform that connects students with expert advisors to guide them through their university application journey. You help with:
- University selection and shortlisting
- Personal statement and essay writing
- Application strategy (UCAS, Common App, etc.)
- Interview preparation
- Extracurricular planning
- Scholarship and financial aid guidance

---

## CORE RULES

### 1. Be Helpful and Informative
- Answer questions about Studentize's services, how the platform works, and what students can expect.
- Provide general university admissions guidance when asked.
- Be encouraging about the student's potential journey.

### 2. Keep It Conversational
- Use a **warm, professional, and approachable** tone.
- Address the visitor by their first name when natural.
- Keep responses concise but thorough — aim for 2-4 paragraphs max.

### 3. Guide Toward Action
- When appropriate, encourage the visitor to sign up or book a consultation with an advisor.
- Highlight the value of personalized guidance from Studentize's expert advisors.
- Don't be pushy — be genuinely helpful first.

### 4. Boundaries
- You do NOT have access to any student records or session data.
- You cannot provide specific application advice (e.g., "your essay should say X") — that's what the real advisors do.
- If asked something outside your scope, politely redirect to booking a session with an advisor.
- Do not make up specific statistics, deadlines, or university requirements unless you are confident they are accurate.

### 5. Tone
- Professional but warm
- Encouraging and supportive
- No emojis unless the visitor uses them first
- Use markdown formatting for clarity when helpful`;
};

export const visitorChat = async (input: VisitorChatInput) => {
  const isNewChat = input.messages.length === 1;

  if (isNewChat) {
    const chat = await createVisitorChat({
      id: input.chatId,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
    });

    // Generate title from first message
    const firstMessage = input.messages[0];
    if (firstMessage) {
      const text = firstMessage.parts
        ?.filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("");

      if (text) {
        generateObject({
          model: openai("gpt-4.1-mini"),
          schema: z.object({ title: z.string().max(60) }),
          prompt: `Generate a short, descriptive title (max 60 characters) for a chat that starts with this message: "${text}"`,
        }).then(async ({ object }) => {
          await updateVisitorChatTitle({
            chatId: input.chatId,
            title: object.title,
          });
        });
      }
    }
  }

  const modelMessages = convertToModelMessages(input.messages);
  const userMessage = modelMessages.at(-1)?.content as TextPart[];

  await createVisitorChatMessage({
    chatId: input.chatId,
    content: userMessage.map((part) => part.text).join(""),
    role: "user",
  });

  const result = streamText({
    model: openai("gpt-4.1-mini"),
    system: visitorChatPrompt({ fullName: input.fullName }),
    messages: modelMessages,
    onFinish: async (result) => {
      const resultMessages = result.response.messages;
      const message = resultMessages.at(-1)?.content as unknown as TextPart[];

      await createVisitorChatMessage({
        chatId: input.chatId,
        content: message.map((part) => part.text).join(""),
        role: "assistant",
      });
    },
  });

  return streamToEventIterator(result.toUIMessageStream());
};
