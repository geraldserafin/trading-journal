import { db as database } from "@/lib/db";
import { eq } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { TimeSpan, createDate } from "oslo";
import { usersTable } from "./users";

export const passwordResetTokensTable = pgTable("password_reset_tokens", {
  tokenHash: text("token_hash").notNull().primaryKey().unique(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
});

type InsertPasswordResetToken = typeof passwordResetTokensTable.$inferInsert;
type PasswordResetToken = typeof passwordResetTokensTable.$inferSelect;

export const passwordResetTokens = (db: typeof database = database) => {
  return {
    create({
      userId,
      tokenHash,
    }: Omit<InsertPasswordResetToken, "expiresAt">): Promise<PasswordResetToken> {
      return db.transaction(async (tx) => {
        await tx.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, userId));

        return (
          await tx
            .insert(passwordResetTokensTable)
            .values({
              tokenHash,
              userId,
              expiresAt: createDate(new TimeSpan(2, "h")),
            })
            .returning()
        )[0];
      });
    },

    async delete(tokenHash: string): Promise<PasswordResetToken | undefined> {
      return (
        await db
          .delete(passwordResetTokensTable)
          .where(eq(passwordResetTokensTable.tokenHash, tokenHash))
          .returning()
      )[0];
    },
  };
};
