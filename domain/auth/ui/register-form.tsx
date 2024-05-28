"use client";

import Link from "next/link";

import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { register } from "../actions";
import { registerSchema } from "../schemas";
import { BackToLogin } from "./back-to-login";

export default function RegisterForm() {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { execute, status } = useAction(register, {
    onError: (e) => {
      if (e.serverError) {
        form.setError("email", { message: e.serverError });
      }
    },
  });

  return (
    <div className="mx-auto grid w-[360px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Sign up</h1>
        <p className="text-muted-foreground">Enter your email below to create an account</p>
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
                  <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input {...field} disabled={status === "executing"} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={status === "executing"} type="submit" className="w-full">
            Sign up
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account? <BackToLogin>Login</BackToLogin>
      </div>
    </div>
  );
}
