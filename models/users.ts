import { db as database } from "@/lib/db";
import { eq } from "drizzle-orm";
import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
});

type InsertUser = typeof usersTable.$inferInsert;
type InsertUserReturn = { success: true; id: string } | { success: false; error: "email_taken" };

type SelectUser = typeof usersTable.$inferSelect;

export const users = (db: typeof database = database) => ({
  async create(
    values: Omit<InsertUser, "id" | "emailVerified" | "twoFactorSecret" | "twoFactorEnabled">,
  ): Promise<InsertUserReturn> {
    try {
      const [{ id }] = await db.insert(usersTable).values(values).returning();

      return { success: true, id };
    } catch (e: any) {
      if (e?.constraint_name === "users_email_unique") {
        return { success: false, error: "email_taken" };
      }

      throw e;
    }
  },

  async update(
    attribute: { email: string } | { id: string },
    values: Partial<Omit<InsertUser, "id" | "email">>,
  ) {
    await db
      .update(usersTable)
      .set(values)
      .where(
        "email" in attribute ? eq(usersTable.email, attribute.email) : eq(usersTable.id, attribute.id),
      );
  },

  async getFirstBy(attribute: { email: string } | { id: string }): Promise<SelectUser | undefined> {
    return (
      await db
        .select()
        .from(usersTable)
        .where(
          "email" in attribute ? eq(usersTable.email, attribute.email) : eq(usersTable.id, attribute.id),
        )
    )[0];
  },
});
