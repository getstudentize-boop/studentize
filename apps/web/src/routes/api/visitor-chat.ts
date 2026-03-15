import { createServerFileRoute } from "@tanstack/react-start/server";
import { visitorChat } from "@student/api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const ServerRoute = createServerFileRoute("/api/visitor-chat").methods({
  OPTIONS: async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  },
  POST: async ({ request }) => {
    try {
      const body = await request.json();

      const { fullName, email, phone, message, chatId } = body;

      if (!fullName || !email || !phone || !message) {
        return Response.json(
          { error: "Missing required fields: fullName, email, phone, message" },
          { status: 400, headers: corsHeaders },
        );
      }

      const result = await visitorChat({
        chatId,
        fullName,
        email,
        phone,
        message,
      });

      return Response.json(result, { headers: corsHeaders });
    } catch (error) {
      console.error("Visitor chat error:", error);
      return Response.json(
        { error: "Failed to process chat message" },
        { status: 500, headers: corsHeaders },
      );
    }
  },
});
