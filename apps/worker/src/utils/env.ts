import { Env as HonoEnv } from "hono";

export type Env = HonoEnv & {
  TRANSCRIPTIONS: R2Bucket;
};
