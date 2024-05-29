"use server";

import { authorizeRequest, lucia } from "@/lib/auth";
import { ActionError, action } from "@/lib/safe-actions";
import { emailVerificationCodes, passwordResetTokens, sessions, users } from "@/models";
import { Ratelimit } from "@upstash/ratelimit";
import { hash, verify } from "argon2";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isWithinExpirationDate } from "oslo";
import { sha256 } from "oslo/crypto";
import { decodeHex, encodeHex } from "oslo/encoding";
import { TOTPController, createTOTPKeyURI } from "oslo/otp";
import {
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  validateTOTPSchema,
  verifyEmailSchema,
} from "./schemas";

async function createAndSetSession(userId: string, pending: boolean = false) {
  const session = await lucia.createSession(userId, { pending });
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}

async function createAndSendEmailVerificationCode(userId: string, email: string) {
  await emailVerificationCodes().create(userId, email);

  // TODO(g): Send the verification code via an SMTP service
}

async function getPasswordHash(password: string) {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export const register = action({
  validation: registerSchema,
  rateLimit: Ratelimit.tokenBucket(100, "1s", 1),
  serverCode: async ({ password, email }) => {
    const passwordHash = await getPasswordHash(password);

    const createUserResult = await users().create({
      email,
      passwordHash,
    });

    if (!createUserResult.success) {
      // TODO(g): Internalize
      throw new ActionError("This email is already taken");
    }

    await createAndSetSession(createUserResult.id);

    await createAndSendEmailVerificationCode(createUserResult.id, email);

    return redirect("/");
  },
});

export const login = action({
  validation: loginSchema,
  rateLimit: Ratelimit.tokenBucket(5, "2s", 1),
  serverCode: async ({ email, password }) => {
    const user = await users().getFirstBy({ email });

    if (!user?.passwordHash) {
      // TODO(g): Internalize
      throw new ActionError("Invalid email or password");
    }

    const validPassword = await verify(user.passwordHash, password);

    if (!user || !validPassword) {
      // TODO(g): Internalize
      throw new ActionError("Invalid email or password");
    }

    await createAndSetSession(user.id, user.twoFactorEnabled);

    return redirect("/");
  },
});

export const logout = action({
  serverCode: async () => {
    const { session } = await authorizeRequest({
      onSessionPending: (data) => data,
    });

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();

    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return redirect("/auth/login");
  },
});

export const verifyEmailCode = action({
  validation: verifyEmailSchema,
  rateLimit: Ratelimit.tokenBucket(100, "1s", 1),
  serverCode: async ({ code }) => {
    await authorizeRequest({
      onUnauthorized() {
        throw new ActionError("Unauthorized");
      },
      onUnverified: () => {},
      onSessionPending: () => {},
    });

    const user = await emailVerificationCodes().verify(code);

    if (!user) {
      throw new ActionError("Invalid verification code");
    }

    await users().update({ id: user.id }, { emailVerified: true });
    await lucia.invalidateUserSessions(user.id);
    await createAndSetSession(user.id);

    return redirect("/");
  },
});

export const resendEmailCode = action({
  rateLimit: Ratelimit.slidingWindow(4, "1h"),
  serverCode: async () => {
    const { user } = await authorizeRequest({
      onUnauthorized() {
        throw new ActionError("Unauthorized");
      },
      onUnverified: (data) => data,
      onSessionPending: (data) => data,
    });

    if (user.emailVerified) {
      throw new ActionError("Your email is already verified");
    }

    await createAndSendEmailVerificationCode(user.id, user.email);
  },
});

export const requestPasswordReset = action({
  validation: requestPasswordResetSchema,
  rateLimit: Ratelimit.slidingWindow(4, "1h"),
  serverCode: async ({ email }) => {
    const user = await users().getFirstBy({ email });

    if (!user || !user.emailVerified) {
      throw new ActionError("Invalid email");
    }

    const tokenId = generateIdFromEntropySize(25);
    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)));

    const verificationToken = await passwordResetTokens().create({
      userId: user.id,
      tokenHash,
    });

    console.debug(tokenId);

    // TODO(g): send a link with verification token via SMTP service
  },
});

export const resetPassword = action({
  validation: resetPasswordSchema,
  rateLimit: Ratelimit.slidingWindow(4, "1h"),
  serverCode: async ({ password, verificationToken }) => {
    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(verificationToken)));

    const token = await passwordResetTokens().delete(tokenHash);

    if (!token || !isWithinExpirationDate(token.expiresAt)) {
      throw new ActionError("Invaild token");
    }

    await lucia.invalidateUserSessions(token.userId);

    const passwordHash = await getPasswordHash(password);

    await users().update({ id: token.userId }, { passwordHash });
    await createAndSetSession(token.userId);
  },
});

export const enable2fa = action({
  serverCode: async () => {
    const { user } = await authorizeRequest({
      onSessionPending: (data) => data,
    });

    if (user.twoFactorEnabled) {
      throw new ActionError("Two factor authentication already enabled");
    }

    const twoFactorSecret = crypto.getRandomValues(new Uint8Array(20));
    await users().update({ id: user.id }, { twoFactorSecret: encodeHex(twoFactorSecret) });

    return createTOTPKeyURI("trading-journal", user.email, twoFactorSecret);
  },
});

export const validateTOTP = action({
  validation: validateTOTPSchema,
  serverCode: async ({ totp }) => {
    const { user, session } = await authorizeRequest({
      onSessionPending: (data) => data,
    });

    const { twoFactorSecret } = (await users().getFirstBy({ id: user.id }))!;

    if (!twoFactorSecret) {
      redirect("/auth/2fa/enable");
    }

    const validOTP = await new TOTPController().verify(totp, decodeHex(twoFactorSecret!));

    if (!validOTP) {
      throw new ActionError("Invalid code");
    }

    if (!user.twoFactorEnabled) {
      await users().update({ id: user.id }, { twoFactorEnabled: true });
    }

    await sessions().update({ id: session.id }, { pending: false });

    redirect("/");
  },
});
