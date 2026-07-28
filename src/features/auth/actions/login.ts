"use server";

import { getLocale } from "next-intl/server";
import { validateLoginForm } from "../utils/validation/Login";
import { authService } from "../services/authService";
import { ApiError } from "@/shared/lib/api";
import type { ActionState } from "./types";

export async function loginAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const method = (formData.get("method") as "email" | "phone") || "email";
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const password = (formData.get("password") as string) || "";

  const fieldErrors = validateLoginForm({ email, phone, password, method });
  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      fieldErrors,
      message: "Please fix the errors below.",
      payload: { email, phone, password, method },
    };
  }

  const payload =
    method === "email"
      ? { email: email.trim(), password }
      : { phone_number: phone.trim(), password };

  try {
    const response = await authService.login(payload, locale);
    return { success: true, message: response.message || "Login successful.", data: response.data };
  } catch (error) {
    if (error instanceof ApiError) {
      const mapped: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(error.fields)) {
        mapped[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
      }
      const hasFields = Object.keys(mapped).length > 0;
      return {
        success: false,
        message: hasFields ? Object.values(mapped).join(" ") : error.message,
        fieldErrors: hasFields ? mapped : undefined,
        payload: { email, phone, password, method },
      };
    }
    return {
      success: false,
      message: "Network error. Please try again.",
      payload: { email, phone, password, method },
    };
  }
}
