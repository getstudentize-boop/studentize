import { index, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id } from "./utils";

export const organizationStatus = pgEnum("organization_status", [
  "ACTIVE",
  "INACTIVE",
  "PENDING",
]);

export const organization = pgTable("organization", {
  id,
  createdAt,
  name: text("name").notNull(),
  status: organizationStatus().default("PENDING").notNull(),
});

export const membershipRole = pgEnum("membership_role", [
  "OWNER",
  "ADMIN",
  "ADVISOR",
  "STUDENT",
]);

export const membership = pgTable("membership", {
  id,
  createdAt,
  userId: text("user_id").notNull(),
  organizationId: text("organization_id").notNull(),
  role: membershipRole().default("STUDENT").notNull(),
}, (table) => [
  index("membership_user_id_idx").on(table.userId),
  index("membership_org_id_idx").on(table.organizationId),
  index("membership_user_org_idx").on(table.userId, table.organizationId),
]);
