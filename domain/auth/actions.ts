"use server";

import { createUser, getUserBy } from "@/models/users";
import { hash, verify } from "argon2";
import { loginSchema, registerSchema } from "./schemas";
import { ActionError, action } from "@/lib/safe-actions";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function createAndSetSession(userId: string) {
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
}

export const registerAction = action(
  registerSchema,
  async ({ password, email }) => {
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    const createUserResult = await createUser({
      email,
      password_hash: passwordHash,
    });

    if (!createUserResult.success) {
      // TODO(g): Internalize
      throw new ActionError("This email is already taken");
    }

    await createAndSetSession(createUserResult.id);

    return redirect("/");
  },
);

export const loginAction = action(loginSchema, async ({ email, password }) => {
  const user = await getUserBy({ email });

  if (!user?.password_hash) {
    // TODO(g): Internalize
    throw new ActionError("Invalid email or password");
  }

  const validPassword = await verify(user.password_hash, password);

  if (!user || !validPassword) {
    // TODO(g): Internalize
    throw new ActionError("Invalid email or password");
  }

  await createAndSetSession(user.id);

  return redirect("/");
});
