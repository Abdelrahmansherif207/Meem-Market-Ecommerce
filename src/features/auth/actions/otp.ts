"use server";

import { getLocale } from "next-intl/server";
import { authService } from "../services/authService";
import { ApiError } from "@/shared/lib/api";
import type { ActionState } from "./types";

export async function otpAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const code = (formData.get("code") as string) || "";
  const otpId = (formData.get("otpId") as string) || "";

  if (code.length !== 6) {
    return {
      success: false,
      fieldErrors: { code: "Code must be exactly 6 digits." },
      message: "Please enter a valid 6-digit code.",
      payload: { email, phone, code, otpId },
    };
  }

  try {
    const payload = email
      ? { email: email.trim(), code }
      : { phone_number: phone.trim(), code, ...(otpId ? { otp_id: otpId } : {}) };

    const response = await authService.otpLogin(payload, locale);

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Verification failed.",
        payload: { email, phone },
      };
    }

    return {
      success: true,
      message: response.message || "Email verified successfully!",
      data: response.data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const mapped: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(error.fields)) {
        mapped[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
      }
      return {
        success: false,
        message: error.message,
        fieldErrors: Object.keys(mapped).length ? mapped : undefined,
        payload: { email, phone },
      };
    }
    return {
      success: false,
      message: "Network error. Please try again.",
      payload: { email, phone },
    };
  }
}