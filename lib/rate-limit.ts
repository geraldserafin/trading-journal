import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { ActionError } from "./safe-actions";

export async function actionRateLimit(limit: Ratelimit, text = "Please wait before next request") {
  const ip = headers().get("x-forwarded-for")!;
  const { success } = await limit.limit(ip);

  if (!success) {
    throw new ActionError(text);
  }
}
