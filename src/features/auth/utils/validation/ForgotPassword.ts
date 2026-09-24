import { z } from "zod";
import type { FieldErrors } from "../../types";
import type { Translate } from "./index";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{6}$/;

export interface ForgotStepInput {
  email: string;
  token: string;
  password: string;
  passwordConfirmation: string;
}

export type ForgotStep = "email" | "otp" | "reset";

/** Maps zod form keys to the API-shaped field keys the forms render. */
const FIELD_KEY_MAP: Record<string, string> = {
  token: "code",
  passwordConfirmation: "password_confirmation",
};

function createForgotEmailSchema(t: Translate) {
  return z.object({ email: z.string().trim().regex(EMAIL_REGEX, t("validation.emailInvalid")) });
}

export function createForgotOtpSchema(t: Translate) {
  return z.object({
    email: z.string().trim().regex(EMAIL_REGEX, t("validation.emailInvalid")),
    token: z.string().regex(OTP_REGEX, t("validation.otpExact6")),
  });
}

export function createForgotResetSchema(t: Translate) {
  return z
    .object({
      email: z.string().trim().regex(EMAIL_REGEX, t("validation.emailInvalid")),
      token: z.string().regex(OTP_REGEX, t("validation.otpExact6")),
      password: z.string().min(8, t("validation.passwordMin")),
      passwordConfirmation: z.string().min(1, t("validation.confirmRequired")),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: t("validation.passwordsDontMatch"),
      path: ["passwordConfirmation"],
    });
}

export function validateForgotPasswordStep(
  step: ForgotStep,
  input: ForgotStepInput,
  t: Translate,
): FieldErrors {
  const schema =
    step === "email"
      ? createForgotEmailSchema(t)
      : step === "otp"
        ? createForgotOtpSchema(t)
        : createForgotResetSchema(t);

  const result = schema.safeParse(input);
  if (result.success) return {};

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as string;
    const apiKey = FIELD_KEY_MAP[key] ?? key;
    if (!errors[apiKey]) {
      errors[apiKey] = issue.message;
    }
  }
  return errors;
}
