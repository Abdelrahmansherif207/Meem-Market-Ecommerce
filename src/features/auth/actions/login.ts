"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { validateLoginForm } from "../utils/validation/Login";
import { authService } from "../services/authService";
import { isSessionActive } from "../utils/sessionExpiration";
import { setSessionCookie } from "../session/sessionCookies";
import { mapActionError } from "../utils/mapActionError";
import type { SessionSnapshot } from "../types";
import type { ActionState } from "./types";

export async function loginAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const t = await getTranslations("auth");
  const method = (formData.get("method") as "email" | "phone") || "email";
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const password = (formData.get("password") as string) || "";

  const fieldErrors = validateLoginForm({ email, phone, password, method }, t);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      fieldErrors,
      message: t("action.fixErrors"),
      payload: { email, phone, method },
    };
  }

  const payload =
    method === "email"
      ? { email: email.trim(), password }
      : { phone_number: phone.trim(), password };

  try {
    const response = await authService.login(payload, locale);
    if (!response.data?.token || !isSessionActive(response.data.expires_at)) {
      return {
        success: false,
        message: t("action.invalidSessionExpiry"),
        payload: { email, phone, method },
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
      message: response.message || t("action.loginSuccess"),
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
      payload: { email, phone, method },
    };
  }
}
