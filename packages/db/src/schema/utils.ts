import { text, timestamp } from "drizzle-orm/pg-core";

import { createId } from "@paralleldrive/cuid2";

export const timeStamp = (name: string) => timestamp(name);

export const dateNow = (name: string) =>
  timeStamp(name).$defaultFn(() => new Date());

export const createdAt = timestamp("created_at").defaultNow();

export const id = text("id")
  .primaryKey()
  .$default(() => createId());
