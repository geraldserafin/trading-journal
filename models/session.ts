import { db as database } from "@/lib/db";
import { eq } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  pending: boolean("pending").default(false),
});

type InsertSession = typeof sessionsTable.$inferInsert;

export const sessions = (db: typeof database = database) => ({
  async update(
    attribute: { id: string },
    values: Partial<Omit<InsertSession, "id" | "userId" | "expiresAt">>,
  ) {
    await db.update(sessionsTable).set(values).where(eq(sessionsTable.id, attribute.id));
  },
});
