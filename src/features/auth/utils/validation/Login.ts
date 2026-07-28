import { z } from "zod";
import type { FieldErrors } from "../../types";

const passwordSchema = z.string().min(8, "Password must be at least 8 characters.");
const PHONE_REGEX = /^\+[1-9]\d{6,15}$/;

export const loginSchema = z
  .object({
    email: z.string().optional(),
    phone: z.string().optional(),
    password: passwordSchema,
    method: z.enum(["email", "phone"]),
  })
  .superRefine((data, ctx) => {
    if (data.method === "email") {
      if (!data.email?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Email is required.", path: ["email"] });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please enter a valid email address.", path: ["email"] });
      }
    } else {
      if (!data.phone?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Phone number is required.", path: ["phone"] });
      } else if (!PHONE_REGEX.test(data.phone.trim())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please enter a valid phone number.", path: ["phone"] });
      }
    }
  });

interface LoginFormData {
  email?: string;
  phone?: string;
  password: string;
  method: "email" | "phone";
}

export function validateLoginForm(data: LoginFormData): FieldErrors {
  const result = loginSchema.safeParse(data);
  if (result.success) return {};
  return toFieldErrors(result.error);
}

function toFieldErrors(result: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of result.issues) {
    errors[issue.path[0] as string] = issue.message;
  }
  return errors;
}
