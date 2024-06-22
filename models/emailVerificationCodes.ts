import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { User } from "lucia";
import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
import { alphabet, generateRandomString } from "oslo/crypto";
import { usersTable } from "./users";

export const emailVerificationCodesTable = pgTable("email_verification_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const emailVerificationCodes = () => ({
  async create(userId: string, email: string): Promise<string> {
    return await db.transaction(async (tx) => {
      await tx.delete(emailVerificationCodesTable).where(eq(emailVerificationCodesTable.email, email));

      const code = generateRandomString(8, alphabet("0-9"));

      await tx.insert(emailVerificationCodesTable).values({
        userId,
        email,
        code,
        expiresAt: createDate(new TimeSpan(15, "m")),
      });

      return code;
    });
  },

  async verify(code: string): Promise<User | null> {
    const result = await db.transaction(async (tx) => {
      const result = (
        await tx
          .select()
          .from(emailVerificationCodesTable)
          .innerJoin(
            usersTable,
            and(
              eq(emailVerificationCodesTable.userId, usersTable.id),
              eq(emailVerificationCodesTable.email, usersTable.email),
            ),
          )
          .where(eq(emailVerificationCodesTable.code, code))
      )[0];

      if (!result) {
        return null;
      }

      const { users: user, email_verification_codes: databaseCode } = result;

      if (!databaseCode || databaseCode.code !== code) {
        return null;
      }

      await db
        .delete(emailVerificationCodesTable)
        .where(eq(emailVerificationCodesTable.id, databaseCode.id));

      return { user, databaseCode };
    });

    if (result === null || !isWithinExpirationDate(result.databaseCode.expiresAt)) {
      return null;
    }

    return result.user;
  },
});
