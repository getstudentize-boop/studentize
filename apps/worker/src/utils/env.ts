import { Env as HonoEnv } from "hono";

export type Env = HonoEnv & {
  TRANSCRIPTIONS: R2Bucket;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RESEND_FROM_NAME?: string;
};
