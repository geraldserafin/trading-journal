"use client";

import { useCountdown } from "@/lib/hooks/countdown";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { resendEmailCode, verifyEmailCode } from "../actions";
import { verifyEmailSchema } from "../schemas";
import { LogoutButton } from "./logout-button";

export default function VerifyEmailForm() {
  const [resendSuccess, setResendSuccess] = useState(false);

  const { remainingTime, start } = useCountdown();

  const verifyEmailForm = useForm<z.infer<typeof verifyEmailSchema>>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
  });

  const { execute: executeVerifyEmail, status: verifyEmailStatus } = useAction(verifyEmailCode, {
    onError: (e) => {
      if (e.serverError) {
        verifyEmailForm.setError("code", { message: e.serverError });
      }
    },
  });

  const { execute: executeResendCode, status: resendCodeStatus } = useAction(resendEmailCode, {
    onError: (e) => {
      if (e.serverError) {
        verifyEmailForm.setError("code", { message: e.serverError });
      }
      setResendSuccess(false);
    },
    onSuccess: () => {
      setResendSuccess(true);
      verifyEmailForm.clearErrors();
      start(60);
    },
  });

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Verify email</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a link to get back into your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Form {...verifyEmailForm}>
          <form className="grid gap-4" onSubmit={verifyEmailForm.handleSubmit(executeVerifyEmail)}>
            <FormField
              control={verifyEmailForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={verifyEmailStatus === "executing"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={verifyEmailStatus === "executing"} type="submit" className="w-full">
              Verify
            </Button>
          </form>
        </Form>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => executeResendCode({})}
          disabled={resendCodeStatus === "executing" || remainingTime !== undefined}
        >
          Resend
          {remainingTime && ` (${remainingTime})`}
        </Button>
        {resendSuccess && <p className="text-sm text-green-600 text-center">New code sent!</p>}
      </CardContent>
      <CardFooter className="flex justify-center">
        <LogoutButton variant="link" className="underline" />
      </CardFooter>
    </Card>
  );
}
