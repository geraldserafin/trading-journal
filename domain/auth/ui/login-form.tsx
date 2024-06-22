"use client";

import Link from "next/link";

import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "../actions";
import { loginSchema } from "../schemas";
import { GoogleSignInButton } from "./google-sign-in-button";

export default function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { execute, status } = useAction(login, {
    onError: (e) => {
      if (e.serverError) {
        form.setError("email", { message: e.serverError });
      }
    },
  });

  return (
    <div className="mx-auto grid w-[360px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-muted-foreground">Enter your email below to login to your account</p>
      </div>
      <Form {...form}>
        <form className="grid gap-4" onSubmit={form.handleSubmit(execute)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled={status === "executing"} placeholder="m@example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>Password</FormLabel>
                  <Link href="/auth/reset-password" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                  </Link>
                </div>

                <FormControl>
                  <Input {...field} disabled={status === "executing"} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={status === "executing"} type="submit" className="w-full">
            Login
          </Button>
          <GoogleSignInButton />
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
