import { pgEnum, pgTable, serial, text } from "drizzle-orm/pg-core";

import { createdAt } from "./utils";

export const userType = pgEnum("user_type", ["ADMIN", "ADVISOR", "STUDENT"]);
export const userStatus = pgEnum("user_status", [
  "ACTIVE",
  "INACTIVE",
  "PENDING",
]);

export const user = pgTable("user", {
  id: serial("id").primaryKey(),
  createdAt,
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  type: userType().notNull(),
  status: userStatus().notNull(),
});
