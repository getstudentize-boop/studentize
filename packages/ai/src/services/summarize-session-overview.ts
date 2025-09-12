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
      "You are a helpful assistant that updates a students sessions overview based on a new transcript summary. Your task is to integrate the new information from the transcript summary into the existing session overview, ensuring that the updated overview is comprehensive and reflects all relevant details discussed in the session.",
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
