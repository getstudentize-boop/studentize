import { createRouteHelper } from "../../utils/middleware";

const sessionConfig = JSON.stringify({
  session: {
    type: "realtime",
    model: "gpt-realtime",
  },
});

export const createTokenRoute = createRouteHelper({
  execute: async () => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/realtime/client_secrets",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: sessionConfig,
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        value: string;
      };

      return data;
    } catch (error) {
      console.error("Token generation error:", error);
      throw error;
    }
  },
});
