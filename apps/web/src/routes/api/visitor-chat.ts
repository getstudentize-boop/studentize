import { createServerFileRoute } from "@tanstack/react-start/server";
import { visitorChat } from "@student/api/src/routes/visitor-chat/chat";

export const ServerRoute = createServerFileRoute("/api/visitor-chat").methods({
  POST: async ({ request }) => {
    try {
      const body = await request.json();

      const { fullName, email, phone, message, chatId } = body;

      if (!fullName || !email || !phone || !message) {
        return Response.json(
          { error: "Missing required fields: fullName, email, phone, message" },
          { status: 400 },
        );
      }

      const result = await visitorChat({
        chatId,
        fullName,
        email,
        phone,
        message,
      });

      return Response.json(result);
    } catch (error) {
      console.error("Visitor chat error:", error);
      return Response.json(
        { error: "Failed to process chat message" },
        { status: 500 },
      );
    }
  },
});
