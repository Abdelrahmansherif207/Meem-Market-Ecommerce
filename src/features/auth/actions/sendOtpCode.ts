"use server";

import { getLocale } from "next-intl/server";
import { authService } from "../services/authService";
import { ApiError } from "@/shared/lib/api";
import type { ActionState } from "./types";

export async function sendOtpCodeAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";

  if (!email && !phone) {
    return { success: false, message: "Email or phone is required." };
  }

  try {
    const payload = email ? { email: email.trim() } : { phone_number: phone.trim() };
    const response = await authService.sendOtpCode(payload, locale);

    return {
      success: true,
      message: response.message || "OTP code sent successfully!",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}