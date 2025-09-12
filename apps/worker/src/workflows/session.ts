import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";

import { Env } from "../utils/env";

export class SessionWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const object = await this.env.TRANSCRIPTIONS.get("example.txt");

    if (object === null) {
      console.log("Object not found");
      return;
    }

    const text = await object.text();
  }
}
