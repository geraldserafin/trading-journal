import { createAuthorizationURL, googleProvider } from "@/domain/auth/oauth";
import { redirect } from "next/navigation";

export async function GET(): Promise<Response> {
  const url = await createAuthorizationURL(
    async (state, codeVerifier) =>
      await googleProvider.createAuthorizationURL(state, codeVerifier, { scopes: ["profile", "email"] }),
  );
  redirect(url.href);
}
