"use server";

import { getLocale } from "next-intl/server";
import { authService } from "../services/authService";
import { ApiError } from "@/shared/lib/api";
import type { ActionState } from "./types";

export async function forgotPasswordAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const step = (formData.get("step") as string) || "email";
  const email = ((formData.get("email") as string) || "").trim();
  const token = (formData.get("token") as string) || "";
  const password = (formData.get("password") as string) || "";
  const passwordConfirmation = (formData.get("password_confirmation") as string) || "";

  const payload: Record<string, string> = { step, email, token };

  if (step === "email") {
    if (!email) {
      return { success: false, fieldErrors: { email: "Email is required." }, message: "Please enter your email address.", payload };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, fieldErrors: { email: "Please enter a valid email address." }, message: "Please enter a valid email address.", payload };
    }

    try {
      const response = await authService.requestForgetPassword({ email }, locale);
      return { success: true, message: response.message || "Check your inbox for the OTP code.", payload: { ...payload, otp_sent: "true" } };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, message: error.message, payload };
      }
      return { success: false, message: "Network error. Please try again.", payload };
    }
  }

  if (step === "otp") {
    if (token.length !== 6 || !/^\d{6}$/.test(token)) {
      return { success: false, fieldErrors: { code: "OTP must be exactly 6 digits." }, message: "Please enter a valid 6-digit OTP.", payload };
    }
    if (!email) {
      return { success: false, message: "Session expired. Please start again.", payload };
    }

    try {
      const verified = await authService.verifyForgetPasswordToken({ email, token }, locale);
      if (!verified) {
        return { success: false, message: "Invalid or expired OTP. Please try again.", payload };
      }
      return { success: true, message: "OTP verified successfully.", payload: { ...payload, token_verified: "true" } };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, message: error.message, payload };
      }
      return { success: false, message: "Network error. Please try again.", payload };
    }
  }

  if (step === "reset") {
    const fieldErrors: Record<string, string> = {};
    if (!password || password.length < 8) {
      fieldErrors.password = "Password must be at least 8 characters.";
    }
    if (password !== passwordConfirmation) {
      fieldErrors.password_confirmation = "Passwords do not match.";
    }
    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, fieldErrors, message: "Please fix the errors below.", payload: { ...payload, password_confirmation: passwordConfirmation } };
    }
    if (!email || !token) {
      return { success: false, message: "Session expired. Please start again.", payload };
    }

    try {
      await authService.resetPassword({ email, token, newPassword: password, newPassword_confirmation: passwordConfirmation }, locale);
      return { success: true, message: "Password has been reset successfully. Please sign in with your new password.", payload: {} };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, message: error.message, payload };
      }
      return { success: false, message: "Network error. Please try again.", payload };
    }
  }

  return { success: false, message: "Invalid step.", payload };
}
