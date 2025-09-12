import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";

import { Env } from "../utils/env";
import { client } from "../utils/orpc";

export class SummarizeSessionWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<{ sessionId: string }>, step: WorkflowStep) {
    const sessionId = event.payload.sessionId;

    await step.do("Summarize transcription", async () => {
      const result = await client.session.summarizeTranscription({
        sessionId,
      });

      return result;
    });
  }
}
