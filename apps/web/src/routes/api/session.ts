import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/session").methods({
  POST: async ({ request }) => {
    const sdpOffer = await request.text();
    const fd = new FormData();

    fd.set("sdp", sdpOffer);
    fd.set(
      "session",
      JSON.stringify({
        type: "realtime",
        model: "gpt-realtime",
        audio: {
          output: { voice: "ash" },
          input: {
            transcription: {
              model: "gpt-4o-transcribe",
              language: "en",
            },
            noise_reduction: { type: "near_field" },
          },
        },
      })
    );

    try {
      const r = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: fd,
      });
      const sdp = await r.text();

      return new Response(sdp, { status: r.status });
    } catch (error) {
      console.error("Token generation error:", error);
      return Response.json(
        { error: "Failed to generate token" },
        { status: 500 }
      );
    }
  },
});
