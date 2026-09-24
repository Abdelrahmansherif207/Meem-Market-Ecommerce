"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { authService } from "../services/authService";
import { mapActionError } from "../utils/mapActionError";
import type { ActionState } from "./types";

export async function sendOtpCodeAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const t = await getTranslations("auth");
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";

  if (!email && !phone) {
    return { success: false, message: t("action.contactRequired") };
  }

  try {
    const payload = email ? { email: email.trim() } : { phone_number: phone.trim() };
    const response = await authService.sendOtpCode(payload, locale);

    return {
      success: true,
      message: response.message || t("action.otpSent"),
    };
  } catch (error) {
    const { message } = mapActionError(error, t("action.networkError"));
    return {
      success: false,
      message,
    };
  }
}
