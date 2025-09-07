export * from "drizzle-orm";
export { createId } from "@paralleldrive/cuid2";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export * as schema from "./schema";
export * from "./adapter";

import * as schema from "./schema";

export const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
