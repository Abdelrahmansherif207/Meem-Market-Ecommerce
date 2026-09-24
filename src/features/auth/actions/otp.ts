"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { authService } from "../services/authService";
import { isSessionActive } from "../utils/sessionExpiration";
import { setSessionCookie } from "../session/sessionCookies";
import { mapActionError } from "../utils/mapActionError";
import type { SessionSnapshot } from "../types";
import type { ActionState } from "./types";

export async function otpAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const t = await getTranslations("auth");
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const code = (formData.get("code") as string) || "";
  const otpId = (formData.get("otpId") as string) || "";

  if (code.length !== 6) {
    return {
      success: false,
      fieldErrors: { code: t("validation.codeExact6") },
      message: t("action.enterValidCode"),
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
        message: response.message || t("action.verificationFailed"),
        payload: { email, phone },
      };
    }

    if (!response.data?.token || !isSessionActive(response.data.expires_at)) {
      return {
        success: false,
        message: t("action.invalidSessionExpiry"),
        payload: { email, phone },
      };
    }

    await setSessionCookie(response.data.token, response.data.expires_at);

    const snapshot: SessionSnapshot = {
      isAuthenticated: true,
      id: response.data.id,
      permissions: response.data.permissions,
      role: response.data.role,
      email_verified: response.data.email_verified,
      email: response.data.email,
      phone_number: response.data.phone_number,
      expires_at: response.data.expires_at,
    };

    return {
      success: true,
      message: response.message || t("action.otpVerified"),
      data: snapshot,
    };
  } catch (error) {
    const { message, fieldErrors } = mapActionError(
      error,
      t("action.networkError"),
    );
    return {
      success: false,
      message,
      fieldErrors,
      payload: { email, phone },
    };
  }
}
