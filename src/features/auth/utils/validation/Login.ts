import { z } from "zod";
import type { FieldErrors } from "../../types";

export type Translate = (key: string) => string;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+[1-9]\d{6,15}$/;

export interface LoginFormData {
  email?: string;
  phone?: string;
  password: string;
  method: "email" | "phone";
}

export function createLoginSchema(t: Translate) {
  return z
    .object({
      email: z.string().optional(),
      phone: z.string().optional(),
      password: z.string().min(8, t("validation.passwordMin")),
      method: z.enum(["email", "phone"]),
    })
    .superRefine((data, ctx) => {
      if (data.method === "email") {
        if (!data.email?.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.emailRequired"), path: ["email"] });
        } else if (!EMAIL_REGEX.test(data.email.trim())) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.emailInvalid"), path: ["email"] });
        }
      } else {
        if (!data.phone?.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.phoneRequired"), path: ["phone"] });
        } else if (!PHONE_REGEX.test(data.phone.trim())) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.phoneInvalid"), path: ["phone"] });
        }
      }
    });
}

export function validateLoginForm(data: LoginFormData, t: Translate): FieldErrors {
  const result = createLoginSchema(t).safeParse(data);
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
