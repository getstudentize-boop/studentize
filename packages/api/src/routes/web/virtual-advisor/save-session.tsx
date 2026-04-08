import { z } from "zod";
import {
  createVirtualAdvisorSession,
  updateVirtualAdvisorSession,
  createVirtualAdvisorMessages,
  getVirtualAdvisorSessionById,
} from "@student/db";
import { generateObject } from "ai";
import { openai } from "../../../utils/openai";

export const SaveSessionInputSchema = z.object({
  sessionId: z.string().optional(),
  advisorSlug: z.string(),
  messages: z.array(
    z.discriminatedUnion("role", [
      z.object({
        role: z.literal("user"),
        text: z.string(),
      }),
      z.object({
        role: z.literal("assistant"),
        text: z.string(),
      }),
      z.object({
        role: z.literal("tool"),
        metadata: z.object({
          toolName: z.string(),
          input: z.unknown(),
          output: z.unknown().optional(),
        }),
      }),
    ]),
  ),
});

export const saveSessionRoute = async ({
  context,
  input,
}: {
  context: { user: { id: string } };
  input: z.infer<typeof SaveSessionInputSchema>;
}) => {
  const { sessionId, advisorSlug, messages } = input;
  const studentUserId = context.user.id;

  let currentSessionId = sessionId;

  // Create session if it doesn't exist
  if (!currentSessionId) {
    const session = await createVirtualAdvisorSession({
      studentUserId,
      advisorSlug,
    });
    currentSessionId = session.id;
  } else {
    // Verify session belongs to user
    const session = await getVirtualAdvisorSessionById({
      sessionId: currentSessionId,
      studentUserId,
    });
    if (!session) {
      throw new Error("Session not found");
    }
  }

  // Save messages
  if (messages.length > 0) {
    await createVirtualAdvisorMessages(
      messages.map((msg) => {
        if (msg.role === "tool") {
          return {
            sessionId: currentSessionId!,
            role: msg.role,
            text: null,
            metadata: msg.metadata,
          };
        }
        return {
          sessionId: currentSessionId!,
          role: msg.role,
          text: msg.text,
          metadata: null,
        };
      }),
    );
  }

  // Generate title if session doesn't have one and has enough messages
  const session = await getVirtualAdvisorSessionById({
    sessionId: currentSessionId,
    studentUserId,
  });

  if (!session?.title && session?.messages && session.messages.length >= 2) {
    const conversationText = session.messages
      .filter((msg) => msg.role !== "tool" && msg.text)
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.text}`,
      )
      .join("\n");

    try {
      const { object } = await generateObject({
        model: openai("gpt-5.4-mini"),
        schema: z.object({
          title: z.string().max(60),
        }),
        prompt: `Generate a short, descriptive title (max 60 characters) for this conversation:\n\n${conversationText}`,
      });

      await updateVirtualAdvisorSession({
        sessionId: currentSessionId,
        title: object.title,
      });
    } catch (error) {
      console.error("Failed to generate title:", error);
      // Continue without title
    }
  }

  return { sessionId: currentSessionId };
};
