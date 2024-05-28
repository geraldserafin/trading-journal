"use client";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { requestPasswordReset } from "../actions";
import { requestPasswordResetSchema } from "../schemas";
import { BackToLogin } from "./back-to-login";

export default function RequestPasswordResetForm() {
  const [success, setSuccess] = useState(false);

  const resetPasswordForm = useForm<z.infer<typeof requestPasswordResetSchema>>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const { execute: executePasswordResetRequest, status: requestPasswordResetStatus } = useAction(
    requestPasswordReset,
    {
      onError: (e) => {
        if (e.serverError) {
          setSuccess(false);
          resetPasswordForm.setError("email", { message: e.serverError });
        }
      },
      onSuccess: () => {
        setSuccess(true);
      },
    },
  );

  return (
    <Card className="max-w-[360px] w-full">
      <CardHeader>
        <CardTitle>Trouble logging in?</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a link to get back into your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...resetPasswordForm}>
          <form
            className="grid gap-4"
            onSubmit={resetPasswordForm.handleSubmit(executePasswordResetRequest)}
          >
            <FormField
              control={resetPasswordForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={requestPasswordResetStatus === "executing"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={requestPasswordResetStatus === "executing"}
              type="submit"
              className="w-full"
            >
              Request reset link
            </Button>
            {success && (
              <p className="text-sm text-green-500 text-center">Request link sent! Check your inbox.</p>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <BackToLogin>Back to login</BackToLogin>
      </CardFooter>
    </Card>
  );
}
