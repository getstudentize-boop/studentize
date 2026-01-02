import { Hono } from "hono";
import { cors } from "hono/cors";

import { z } from "zod";

import { zValidator } from "@hono/zod-validator";
import { getAccessToken } from "./utils/context";
import { client } from "./utils/orpc";

type Bindings = {
  SUMMARIZE_SESSION_WORKFLOW: Workflow<{
    sessionId: string;
    accessToken: string;
  }>;
  AUTO_JOIN_SESSION_WORKFLOW: Workflow<{
    scheduledSessionId: string;
    accessToken: string;
  }>;
  DOWNLOAD_REPLAY_WORKFLOW: Workflow<{
    sessionId: string;
    accessToken: string;
  }>;
  ADMIN_TOKEN: string;
  API_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/*", cors());

app.get("/health", (c) => {
  return c.text("ok");
});

app.post("/session/done", async (c) => {
  const { accessToken } = await getAccessToken({ c });

  if (!accessToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const payload = await c.req.json();

  const { data } = payload;

  await client.admin.saveScheduledSession(
    {
      botId: data.bot.id,
    },
    { context: { accessToken } }
  );

  return c.json({ status: "ok" });
});

app.post(
  "/sessions/auto-join",
  zValidator(
    "json",
    z.object({
      scheduledSessionId: z.string(),
    })
  ),
  async (c) => {
    const { scheduledSessionId } = c.req.valid("json");
    const { accessToken } = await getAccessToken({ c });

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await c.env.AUTO_JOIN_SESSION_WORKFLOW.create({
      params: { accessToken, scheduledSessionId },
    });

    return c.json({ status: "ok" });
  }
);

app.post(
  "/sessions/summary",
  zValidator(
    "json",
    z.object({
      sessionId: z.string(),
    })
  ),
  async (c) => {
    const { sessionId } = c.req.valid("json");
    const { accessToken } = await getAccessToken({ c });

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await c.env.SUMMARIZE_SESSION_WORKFLOW.create({
      params: { sessionId, accessToken },
    });

    return c.json({ status: "ok" });
  }
);

app.post(
  "/sessions/download-replay",
  zValidator(
    "json",
    z.object({
      sessionId: z.string(),
    })
  ),
  async (c) => {
    const { sessionId } = c.req.valid("json");
    const { accessToken } = await getAccessToken({ c });

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await c.env.DOWNLOAD_REPLAY_WORKFLOW.create({
      params: { sessionId, accessToken: c.env.ADMIN_TOKEN },
    });

    return c.json({ status: "ok" });
  }
);

export { SummarizeSessionWorkflow } from "./workflows/session";
export { AutoJoinSessionWorkflow } from "./workflows/scheduled-session";
export { DownloadReplayWorkflow } from "./workflows/download-replay";

// export default app;
export default {
  fetch: app.fetch,
  async scheduled(_controller: any, env: any) {
    await client.admin.syncScheduledSessions(
      {},
      { context: { accessToken: env.ADMIN_TOKEN } }
    );
  },
};
