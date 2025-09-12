import { openai } from "../openai";

import { generateObject } from "ai";

import { z } from "zod";

export const summarizeTranscript = async (transcript: string) => {
  const { object } = await generateObject({
    model: openai("gpt-4.1-mini"),
    system:
      "You are a helpful assistant that summarizes transcripts of meetings between students and their academic advisors. Your task is to extract key information and present it in a concise, well-structured format using bullet points or short paragraphs. Focus on main discussion topics, decisions made, action items, and important insights. Keep the summary brief while capturing essential details.",
    prompt: transcript,
    schema: z.object({
      summary: z.string(),
    }),
  });

  return object.summary;
};
