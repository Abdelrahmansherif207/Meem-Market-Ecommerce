import { z } from "zod";
import type { FieldErrors } from "../../types";

const emailSchema = z.string().trim().email("Please enter a valid email address.");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters.");
const phoneSchema = z.string().trim().min(1, "Phone number is required.");

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters."),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters."),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, "Please confirm your password."),
    policy: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms & conditions.",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
  policy: boolean;
}

export function validateRegisterForm(data: RegisterFormData): FieldErrors {
  const result = registerSchema.safeParse(data);
  if (result.success) return {};
  return toFieldErrors(result.error);
}

function toFieldErrors(result: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of result.issues) {
    const fieldMap: Record<string, string> = {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      phone: "phone",
      password: "password",
      passwordConfirmation: "password_confirmation",
      policy: "policy",
    };
    const key = issue.path[0] as string;
    const mapped = fieldMap[key] || key;
    if (!errors[mapped]) {
      errors[mapped] = issue.message;
    }
  }
  return errors;
}
