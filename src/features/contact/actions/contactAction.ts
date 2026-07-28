"use server";

import { apiFetch, ApiError } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import { validateContactForm } from "../schemas/contactSchema";
import type { ActionState } from "../types";

export async function contactAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get("name") as string) || "";
  const email = (formData.get("email") as string) || "";
  const subject = (formData.get("subject") as string) || "";
  const message = (formData.get("message") as string) || "";

  const fieldErrors = validateContactForm({ name, email, subject, message });
  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      fieldErrors,
      message: "Please fix the errors below.",
      payload: { name, email, subject, message },
    };
  }

  try {
    await apiFetch<ApiResponse<unknown>>("/contact-us", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      timeout: 10000,
    });
    return { success: true, message: "Your message has been sent successfully. We'll get back to you soon." };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        return {
          success: false,
          message: "Too many attempts. Please try again later.",
          payload: { name, email, subject, message },
        };
      }
      const mapped: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(error.fields)) {
        mapped[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
      }
      const hasFields = Object.keys(mapped).length > 0;
      return {
        success: false,
        message: hasFields ? Object.values(mapped).join(" ") : error.message,
        fieldErrors: hasFields ? mapped : undefined,
        payload: { name, email, subject, message },
      };
    }
    return {
      success: false,
      message: "Network error. Please try again.",
      payload: { name, email, subject, message },
    };
  }
}
