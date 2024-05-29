import { sessionsTable } from "@/models/session";
import { usersTable } from "@/models/users";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, Session, User } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionsTable, usersTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: ({ email, emailVerified, twoFactorEnabled }) => ({
    email,
    emailVerified,
    twoFactorEnabled,
  }),
  getSessionAttributes: ({ pending }) => ({
    pending,
  }),
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      emailVerified: boolean;
      email: string;
      twoFactorEnabled: boolean;
    };
    DatabaseSessionAttributes: {
      pending: boolean;
    };
  }
}

type AuthorizeRequestProps<T> = {
  onUnauthorized?: () => T;
  onUnverified?: (props: { user: User; session: Session }) => T;
  onSessionPending?: (props: { user: User; session: Session }) => T;
};

type AuthorizeRequestResult<T> = { user: User; session: Session } | T;

export const authorizeRequest = cache(
  async <T = never>(
    props?: AuthorizeRequestProps<T> | undefined,
  ): Promise<AuthorizeRequestResult<T>> => {
    const onUnauthorized = props?.onUnauthorized ?? (() => redirect("/auth/login"));
    const onSessionPending = props?.onSessionPending ?? (() => redirect("/auth/2fa/verify"));
    const onUnverified = props?.onUnverified ?? (() => redirect("/auth/verify-email"));

    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return onUnauthorized();
    }

    const { session, user } = await lucia.validateSession(sessionId);

    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();

      try {
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      } catch {}

      return onUnauthorized();
    }

    if (session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);

      try {
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      } catch {}
    }

    if (!user.emailVerified) {
      return onUnverified({ user, session });
    }

    if (session.pending) {
      return onSessionPending({ user, session });
    }

    return { user, session };
  },
);
