import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

export const userType = pgEnum("user_type", ["ADMIN", "ADVISOR", "STUDENT"]);
export const userStatus = pgEnum("user_status", [
  "ACTIVE",
  "INACTIVE",
  "PENDING",
]);

export const user = pgTable("user", {
  id,
  createdAt,
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  type: userType().default("STUDENT").notNull(),
  status: userStatus().default("PENDING").notNull(),
});
