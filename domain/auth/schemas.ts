import { z } from "zod";

const passwordSchema = z.string().min(8).max(255);
const emailSchema = z.string().email();

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
