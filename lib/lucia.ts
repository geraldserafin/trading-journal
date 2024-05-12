import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@/lib/db";
import { Lucia } from "lucia";
import { users } from "@/lib/schema/users";
import { sessions } from "@/lib/schema/sessions";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: { secure: process.env.NODE_ENV === "production" },
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
  }
}
