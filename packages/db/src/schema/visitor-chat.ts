import { pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

export const visitorChat = pgTable("visitor_chat", {
  id,
  createdAt,
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  title: text("title"),
});

export const visitorChatMessage = pgTable("visitor_chat_message", {
  id,
  createdAt,
  chatId: text("chat_id")
    .notNull()
    .references(() => visitorChat.id, { onDelete: "cascade" }),
  role: text("role").notNull().$type<"user" | "assistant">(),
  content: text("content").notNull(),
});
