"use server";

import { getLocale } from "next-intl/server";
import { validateRegisterForm } from "../utils/validation/Register";
import { authService } from "../services/authService";
import { ApiError } from "@/shared/lib/api";
import type { ActionState } from "./types";

export async function registerAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const firstName = (formData.get("firstName") as string) || "";
  const lastName = (formData.get("lastName") as string) || "";
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const password = (formData.get("password") as string) || "";
  const passwordConfirmation = (formData.get("passwordConfirmation") as string) || "";
  const policy = formData.get("policy") === "on";
  const avatar = formData.get("avatar") as File | null;

  const payload = { firstName, lastName, email, phone, password, passwordConfirmation, policy: policy ? "on" : "off" };

  const fieldErrors = validateRegisterForm({
    firstName,
    lastName,
    email,
    phone,
    password,
    passwordConfirmation,
    policy,
  });

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors, message: "Please fix the errors below.", payload };
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
      message: response.message || "Account created successfully.",
      payload: { email, phone, otp_status: otpStatus },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const mapped: Record<string, string> = {};
      const KEY_MAP: Record<string, string> = { phone_number: "phone" };
      for (const [key, msgs] of Object.entries(error.fields)) {
        const formKey = KEY_MAP[key] || key;
        mapped[formKey] = Array.isArray(msgs) ? msgs[0] : String(msgs);
      }
      const hasFields = Object.keys(mapped).length > 0;
      return {
        success: false,
        message: hasFields ? Object.values(mapped).join(" ") : error.message,
        fieldErrors: hasFields ? mapped : undefined,
        payload,
      };
    }
    return {
      success: false,
      message: "Network error. Please try again.",
      payload,
    };
  }
}