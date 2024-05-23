import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  password_hash: text("password_hash").notNull(),
});

type InsertUser = Omit<typeof usersTable.$inferInsert, "id">;
type InsertUserReturn =
  | { success: true; id: string }
  | { success: false; error: "email_taken" };

export async function createUser(
  values: InsertUser,
): Promise<InsertUserReturn> {
  try {
    const [{ id }] = await db
      .insert(usersTable)
      .values(values)
      .returning({ id: usersTable.id });

    return { success: true, id };
  } catch (e: any) {
    if (e?.constraint_name === "users_email_unique") {
      return { success: false, error: "email_taken" };
    }

    throw e;
  }
}

export async function getUserBy(attribute: { email: string } | { id: string }) {
  return (
    await db
      .select()
      .from(usersTable)
      .where(
        "email" in attribute
          ? eq(usersTable.email, attribute.email)
          : eq(usersTable.id, attribute.id),
      )
  )[0];
}
