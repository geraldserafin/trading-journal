import { Algorithm, Ratelimit } from "@upstash/ratelimit";
import {
  DEFAULT_SERVER_ERROR,
  SafeClientOpts,
  ServerCodeFn,
  createSafeActionClient,
} from "next-safe-action";
import { headers } from "next/headers";
import { Schema, z } from "zod";
import { authorizeRequest } from "./auth";
import { redis } from "./redis";

export class ActionError extends Error {}

const defaultClientConfig: SafeClientOpts<unknown, unknown> | undefined = {
  handleReturnedServerError(e) {
    if (e instanceof ActionError) {
      return e.message;
    }

    return process.env.NODE_ENV === "development" ? e.message : DEFAULT_SERVER_ERROR;
  },
};

const createActionClient = <const MiddlewareData, const Context>(
  config: SafeClientOpts<MiddlewareData, Context> | undefined,
) => {
  const client = createSafeActionClient(config);

  return <const S extends Schema, const Data>(actionSettings: {
    validation?: S;
    serverCode: ServerCodeFn<S, Data, MiddlewareData>;
    rateLimit?: Algorithm<any> | { algorithm: Algorithm<any>; message?: string };
  }) => {
    const { validation: schema, serverCode: fn } = actionSettings;

    async function alteredFn(parsedInput: z.infer<S>, ctx: MiddlewareData): Promise<Data> {
      if (actionSettings.rateLimit) {
        const { algorithm, message } =
          typeof actionSettings.rateLimit === "object"
            ? {
                algorithm: actionSettings.rateLimit.algorithm,
                message: actionSettings.rateLimit.message,
              }
            : {
                algorithm: actionSettings.rateLimit,
                message: undefined,
              };

        const resendEmailCodeRateLimit = new Ratelimit({
          redis,
          limiter: algorithm,
        });

        const ip = headers().get("x-forwarded-for")!;
        const { success } = await resendEmailCodeRateLimit.limit(ip);

        if (!success) {
          throw new ActionError(message ?? "Rate limit reached. Please try again later.");
        }
      }

      return await fn(parsedInput, ctx);
    }

    return client(schema ?? z.object({}), alteredFn);
  };
};

export const action = createActionClient(defaultClientConfig);

export const authorizedAction = createActionClient({
  ...defaultClientConfig,
  async middleware(_) {
    const { user, session } = await authorizeRequest({
      onUnauthorized: () => {
        throw new ActionError("Unauthorized");
      },
    });

    return { user, session };
  },
});
