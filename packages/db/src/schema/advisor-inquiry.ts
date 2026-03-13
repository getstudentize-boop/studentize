import { pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

export const advisorInquiry = pgTable("advisor_inquiry", {
  id,
  createdAt,
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
});
