import { openai } from "../openai";

import { generateObject } from "ai";

import { z } from "zod";

export const summarizeSessionOverview = async (input: {
  studentSessionOverview: string;
  transcriptSummary: string;
}) => {
  const { object } = await generateObject({
    model: openai("gpt-4.1-mini"),
    system:
      "You are a helpful assistant that updates a student's session overview based on a new transcript summary. Your task is to integrate the new information from the transcript summary into the existing session overview. Keep the output concise and well-structured using bullet points or short paragraphs. Focus on key topics discussed, action items, and important insights. Maintain clarity while being brief.",
    prompt: [
      `Student Session Overview:\n\n${input.studentSessionOverview || "n/a"}`,
      `--`,
      `Transcript Summary:\n\n${input.transcriptSummary}`,
    ].join("\n\n"),
    schema: z.object({
      newSessionOverview: z.string(),
    }),
  });

  return object.newSessionOverview;
};
