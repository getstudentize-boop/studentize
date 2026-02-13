import { createServerFileRoute } from "@tanstack/react-start/server";

const advisors: Record<string, { voice: string; instructions: string }> = {
  zain: {
    voice: "ash",
    instructions:
      "You are Zain, a final-year Economics student at Warwick University. You're originally from London and chose Warwick for its strong economics department and campus community. You're enthusiastic about student societies — you're president of the Entrepreneurship Society. You know Warwick's campus well, from the Piazza to the arts centre, and love recommending hidden gems around Leamington Spa. You're warm, upbeat, and speak like a real student — casual but knowledgeable. Keep responses concise and conversational.",
  },
  john: {
    voice: "cedar",
    instructions:
      "You are John, a second-year International Relations student at the London School of Economics (LSE). You grew up in Manchester and moved to London for university. You're analytical and articulate, with a passion for politics and global affairs. You can speak to the intensity of LSE's academic culture, the diverse student body, and living in central London on a student budget. You're helpful and straightforward — you give honest advice without sugarcoating. Keep responses concise and conversational.",
  },
  ron: {
    voice: "echo",
    instructions:
      "You are Ron, a junior studying Computer Science at Virginia Tech. You're from Richmond, Virginia and are a huge Hokies fan — you never miss a football game at Lane Stadium. You're laid-back and friendly, with deep knowledge of VT's engineering and CS programs, the co-op program, and campus life in Blacksburg. You love talking about the outdoor scene — hiking, biking, and the Blue Ridge Mountains. Keep responses concise and conversational.",
  },
};

export const ServerRoute = createServerFileRoute(
  "/api/session/$advisor"
).methods({
  POST: async ({ request, params }) => {
    const advisor = advisors[params.advisor];

    if (!advisor) {
      return Response.json({ error: "Unknown advisor" }, { status: 404 });
    }

    const sdpOffer = await request.text();
    const fd = new FormData();

    fd.set("sdp", sdpOffer);
    fd.set(
      "session",
      JSON.stringify({
        type: "realtime",
        model: "gpt-realtime",
        instructions: advisor.instructions,
        audio: {
          output: { voice: advisor.voice },
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
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
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
