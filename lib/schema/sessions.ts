import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "@/lib/schema/users";

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
