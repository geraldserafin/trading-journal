"use client";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { resetPassword } from "../actions";
import { resetPasswordSchema } from "../schemas";
import { BackToLogin } from "./back-to-login";

export default function PasswordResetForm({ token }: { token: string }) {
  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      verificationToken: token,
      password: "",
      confirmPassword: "",
    },
  });

  const { execute: executePasswordReset, status: passwordResetStatus } = useAction(resetPassword, {
    onError: (e) => {
      if (e.serverError) {
        resetPasswordForm.setError("password", { message: e.serverError });
      }
    },
  });

  return (
    <Card className="max-w-[360px] w-full">
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...resetPasswordForm}>
          <form className="grid gap-4" onSubmit={resetPasswordForm.handleSubmit(executePasswordReset)}>
            <FormField
              control={resetPasswordForm.control}
              name="verificationToken"
              render={({ field }) => (
                <FormItem hidden>
                  <FormControl>
                    <Input {...field} disabled={passwordResetStatus === "executing"} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={resetPasswordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={passwordResetStatus === "executing"} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={resetPasswordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={passwordResetStatus === "executing"} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={passwordResetStatus === "executing"} type="submit" className="w-full">
              Change password
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <BackToLogin>Back to login</BackToLogin>
      </CardFooter>
    </Card>
  );
}
