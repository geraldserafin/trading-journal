import { googleProvider, validateCallback } from "@/domain/auth/oauth";

export async function GET(request: Request): Promise<Response> {
  return await validateCallback({
    request,
    provider: googleProvider,
    providerName: "google",
    fetchUserData: async (tokens) => {
      const url = new URL("https://oauth2.googleapis.com/tokeninfo");
      url.searchParams.set("id_token", tokens.idToken!);

      const data = (await fetch(url.href).then(async (d) => await d.json())) as any;

      return {
        email: data.email,
        id: data.sub,
      };
    },
  });
}
