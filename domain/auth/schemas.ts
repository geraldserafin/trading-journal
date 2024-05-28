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

export const verifyEmailSchema = z.object({
  code: z.string().min(1),
});

export const requestPasswordResetSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    verificationToken: z.string().min(1),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

export const validateTOTPSchema = z.object({
  totp: z.string().min(3),
});
