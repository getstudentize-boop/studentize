import { openai } from "@ai-sdk/openai";
import {
  createVisitorChat,
  createVisitorChatMessage,
  updateVisitorChatTitle,
  getVisitorChatMessages,
  createId,
} from "@student/db";
import { generateText, generateObject } from "ai";
import z from "zod";

export type VisitorChatInput = {
  chatId?: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
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
  const isNewChat = !input.chatId;
  let chatId = input.chatId;

  if (isNewChat) {
    chatId = createId();
    await createVisitorChat({
      id: chatId,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
    });

    // Generate title in the background
    generateObject({
      model: openai("gpt-4.1-mini"),
      schema: z.object({ title: z.string().max(60) }),
      prompt: `Generate a short, descriptive title (max 60 characters) for a chat that starts with this message: "${input.message}"`,
    }).then(async ({ object }) => {
      await updateVisitorChatTitle({
        chatId: chatId!,
        title: object.title,
      });
    });
  }

  await createVisitorChatMessage({
    chatId: chatId!,
    content: input.message,
    role: "user",
  });

  // Build conversation history from DB
  const history = await getVisitorChatMessages({ chatId: chatId! });
  const messages = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const result = await generateText({
    model: openai("gpt-4.1-mini"),
    system: visitorChatPrompt({ fullName: input.fullName }),
    messages,
  });

  await createVisitorChatMessage({
    chatId: chatId!,
    content: result.text,
    role: "assistant",
  });

  return { chatId: chatId!, response: result.text };
};
