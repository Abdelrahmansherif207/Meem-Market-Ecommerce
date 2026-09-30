"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { validateRegisterForm } from "../utils/validation/Register";
import { authService } from "../services/authService";
import { mapActionError } from "../utils/mapActionError";
import type { ActionState } from "./types";

export async function registerAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const t = await getTranslations("auth");
  const firstName = (formData.get("firstName") as string) || "";
  const lastName = (formData.get("lastName") as string) || "";
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const password = (formData.get("password") as string) || "";
  const passwordConfirmation = (formData.get("passwordConfirmation") as string) || "";
  const policy = formData.get("policy") === "on";
  const avatar = formData.get("avatar") as File | null;

  const payload = { firstName, lastName, email, phone, password, passwordConfirmation, policy: policy ? "on" : "off" };

  const fieldErrors = validateRegisterForm(
    {
      firstName,
      lastName,
      email,
      phone,
      password,
      passwordConfirmation,
      policy,
    },
    t,
  );

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors, message: t("action.fixErrors"), payload };
  }

  try {
    const response = await authService.register({
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phone,
      password,
      password_confirmation: passwordConfirmation,
      policy,
      ...(avatar && avatar.size > 0 ? { avatar } : {}),
    }, locale);

    const data = response.data as Record<string, unknown>;
    const otpStatus = data?.otp_status !== undefined ? String(data.otp_status) : "true";

    return {
      success: true,
      message: response.message || t("action.registerSuccess"),
      payload: { email, phone, otp_status: otpStatus },
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
      payload,
    };
  }
}
