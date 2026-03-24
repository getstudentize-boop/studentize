import { createServerFileRoute } from "@tanstack/react-start/server";
import { searchWeb } from "@student/ai/services";

export const ServerRoute = createServerFileRoute(
  "/api/virtual-advisor/search",
).methods({
  POST: async ({ request }) => {
    try {
      const { query } = await request.json();

      if (!query || typeof query !== "string") {
        return Response.json(
          { error: "Missing or invalid query" },
          { status: 400 },
        );
      }

      const result = await searchWeb(query);

      return Response.json({ result });
    } catch (error) {
      console.error("Search error:", error);
      return Response.json({ error: "Search failed" }, { status: 500 });
    }
  },
});
