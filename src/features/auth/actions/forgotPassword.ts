"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { authService } from "../services/authService";
import { validateForgotPasswordStep } from "../utils/validation/ForgotPassword";
import { mapActionError } from "../utils/mapActionError";
import type { ActionState } from "./types";

export async function forgotPasswordAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const t = await getTranslations("auth");
  const step = (formData.get("step") as string) || "email";
  const email = ((formData.get("email") as string) || "").trim();
  const token = (formData.get("token") as string) || "";
  const password = (formData.get("password") as string) || "";
  const passwordConfirmation = (formData.get("password_confirmation") as string) || "";

  const payload: Record<string, string> = { step, email, token };
  const input = { email, token, password, passwordConfirmation };

  if (step === "email") {
    const fieldErrors = validateForgotPasswordStep("email", input, t);
    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, fieldErrors, message: t("validation.emailInvalid"), payload };
    }

    try {
      const response = await authService.requestForgetPassword({ email }, locale);
      return { success: true, message: response.message || t("action.checkInbox"), payload: { ...payload, otp_sent: "true" } };
    } catch (error) {
      const { message } = mapActionError(error, t("action.networkError"));
      return { success: false, message, payload };
    }
  }

  if (step === "otp") {
    const fieldErrors = validateForgotPasswordStep("otp", input, t);
    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, fieldErrors, message: t("action.enterValidCode"), payload };
    }

    try {
      const verified = await authService.verifyForgetPasswordToken({ email, token }, locale);
      if (!verified) {
        return { success: false, message: t("action.invalidOtp"), payload };
      }
      return { success: true, message: t("action.otpVerifiedFp"), payload: { ...payload, token_verified: "true" } };
    } catch (error) {
      const { message } = mapActionError(error, t("action.networkError"));
      return { success: false, message, payload };
    }
  }

  if (step === "reset") {
    const fieldErrors = validateForgotPasswordStep("reset", input, t);
    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, fieldErrors, message: t("action.fixErrors"), payload: { ...payload, password_confirmation: passwordConfirmation } };
    }

    try {
      await authService.resetPassword({ email, token, newPassword: password, newPassword_confirmation: passwordConfirmation }, locale);
      return { success: true, message: t("action.resetSuccess"), payload: {} };
    } catch (error) {
      const { message } = mapActionError(error, t("action.networkError"));
      return { success: false, message, payload };
    }
  }

  return { success: false, message: t("action.invalidStep"), payload };
}
