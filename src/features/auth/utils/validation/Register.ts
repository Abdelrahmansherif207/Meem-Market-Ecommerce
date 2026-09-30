import { z } from "zod";
import type { FieldErrors } from "../../types";
import type { Translate } from "./index";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
  policy: boolean;
}

export function createRegisterSchema(t: Translate) {
  return z
    .object({
      firstName: z.string().trim().min(2, t("validation.firstNameMin")),
      lastName: z.string().trim().min(2, t("validation.lastNameMin")),
      email: z.string().trim().regex(EMAIL_REGEX, t("validation.emailInvalid")),
      phone: z.string().trim().min(1, t("validation.phoneRequired")),
      password: z.string().min(8, t("validation.passwordMin")),
      passwordConfirmation: z.string().min(1, t("validation.confirmRequired")),
      policy: z.boolean().refine((val) => val === true, {
        message: t("validation.policyRequired"),
      }),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: t("validation.passwordsDontMatch"),
      path: ["passwordConfirmation"],
    });
}

/** Maps zod form keys to the API-shaped field keys the forms render. */
const FIELD_KEY_MAP: Record<string, string> = {
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  phone: "phone",
  password: "password",
  passwordConfirmation: "password_confirmation",
  policy: "policy",
};

export function validateRegisterForm(data: RegisterFormData, t: Translate): FieldErrors {
  const result = createRegisterSchema(t).safeParse(data);
  if (result.success) return {};
  return toFieldErrors(result.error);
}

function toFieldErrors(result: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of result.issues) {
    const key = issue.path[0] as string;
    const mapped = FIELD_KEY_MAP[key] || key;
    if (!errors[mapped]) {
      errors[mapped] = issue.message;
    }
  }
  return errors;
}
