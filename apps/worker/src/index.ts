import { Hono } from "hono";
import { cors } from "hono/cors";

import { z } from "zod";

import { zValidator } from "@hono/zod-validator";

type Bindings = {
  SUMMARIZE_SESSION_WORKFLOW: Workflow;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/*", cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

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
    const authorization = c.req.header("Authorization");

    if (!authorization) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [_, accessToken] = authorization.split(" ");

    await c.env.SUMMARIZE_SESSION_WORKFLOW.create({
      params: { sessionId, accessToken },
    });

    return c.json({ status: "ok" });
  }
);

export { SummarizeSessionWorkflow } from "./workflows/session";

export default app;
