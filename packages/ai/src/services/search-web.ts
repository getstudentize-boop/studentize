import { openai } from "../openai";
import { generateText } from "ai";

export const searchWeb = async (query: string) => {
  const { text, sources } = await generateText({
    model: openai("gpt-5.4-mini"),
    prompt: query,
    tools: {
      web_search: openai.tools.webSearch({}),
    },
    toolChoice: "required",
  });

  console.log(sources, text);

  return { text, sources };
};
