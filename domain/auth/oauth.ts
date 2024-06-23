import { lucia } from "@/lib/auth";
import { users } from "@/models";
import {
  Google,
  OAuth2ProviderWithPKCE,
  OAuth2RequestError,
  Tokens,
  generateCodeVerifier,
  generateState,
} from "arctic";
import { cookies } from "next/headers";

export async function createAuthorizationURL(
  getURL: (state: string, codeVerifier: string) => Promise<URL>,
) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await getURL(state, codeVerifier);

  cookies().set("oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  cookies().set("code_verifier", codeVerifier, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return url;
}

export async function validateCallback({
  request,
  provider,
  providerName,
  fetchUserData,
}: {
  request: Request;
  provider: OAuth2ProviderWithPKCE;
  providerName: "google";
  fetchUserData: (tokens: Tokens) => Promise<{ id: string; email: string }>;
}) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const storedState = cookies().get("oauth_state")?.value ?? null;
  const codeVerifier = cookies().get("code_verifier")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    return new Response(null, { status: 400 });
  }

  try {
    const tokens = await provider.validateAuthorizationCode(code, codeVerifier);
    const { id: providerUserId, email } = await fetchUserData(tokens);
    const user = await users().getFirstWhere({
      providerId: providerUserId,
      provider: providerName,
      email,
    });

    let userId = user?.id;

    if (!userId) {
      const createdUser = await users().create({
        providerId: providerUserId,
        email,
        provider: providerName,
        emailVerified: true,
      });

      if (!createdUser.success) {
        return new Response("An account with this email already exists.", {
          status: 400,
        });
      }

      userId = createdUser.id;
    }

    const session = await lucia.createSession(userId, { pending: false });
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      return new Response(null, {
        status: 400,
      });
    }

    console.debug(e);
    return new Response(null, {
      status: 500,
    });
  }
}

export const googleProvider = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.VERCEL_URL!}/auth/login/google/callback`,
);
