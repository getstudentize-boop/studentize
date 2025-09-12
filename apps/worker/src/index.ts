import { Hono } from "hono";

import { z } from "zod";

import { zValidator } from "@hono/zod-validator";

type Bindings = {
  SUMMARIZE_SESSION_WORKFLOW: Workflow;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post(
  "/sessions/summary",
  zValidator(
    "form",
    z.object({
      sessionId: z.string(),
    })
  ),
  async (c) => {
    const { sessionId } = c.req.valid("form");
    await c.env.SUMMARIZE_SESSION_WORKFLOW.create({ params: { sessionId } });
  }
);

export { SummarizeSessionWorkflow } from "./workflows/session";

export default app;
