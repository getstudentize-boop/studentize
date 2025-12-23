import { pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, id } from "./utils";

export const calendar = pgTable("calendar", {
  id,
  createdAt,
  userId: text("user_id").notNull(),
  calendarId: text("calendar_id").notNull(),
});
