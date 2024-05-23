import { DEFAULT_SERVER_ERROR, createSafeActionClient } from "next-safe-action";

export class ActionError extends Error { }

export const action = createSafeActionClient({
  handleReturnedServerError(e) {
    // In this case, we can use the 'MyCustomError` class to unmask errors
    // and return them with their actual messages to the client.
    if (e instanceof ActionError) {
      return e.message;
    }

    // Every other error that occurs will be masked with the default message.
    return DEFAULT_SERVER_ERROR;
  },
});
