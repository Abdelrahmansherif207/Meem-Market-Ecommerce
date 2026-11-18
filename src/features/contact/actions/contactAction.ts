"use server";

import { apiFetch, ApiError } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import { validateContactForm } from "../schemas/contactSchema";
import type { ActionState, ContactValues } from "../types";

/**
 * Public contact endpoint — validated against the live backend contract
 * (`POST /api/v1/contacts`, body: `{ name, email, subject, message }`).
 *
 * Returns translation codes instead of copy so the client can render the
 * result in the active locale.
 */
export async function contactAction(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const values: ContactValues = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    subject: String(formData.get("subject") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };

  const fieldErrors = validateContactForm(values);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors, values };
  }

  try {
    await apiFetch<ApiResponse<unknown>>("/contacts", {
      method: "POST",
      body: JSON.stringify(values),
      timeout: 10_000,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        return { success: false, errorCode: "rateLimited", values };
      }
      // Keep the real cause in the server logs — the client only shows a
      // translated, non-technical message.
      console.error(
        `[contactAction] POST /contacts failed (${error.status}): ${error.message}`,
        error.fields,
      );
      return { success: false, errorCode: "server", values };
    }
    return { success: false, errorCode: "network", values };
  }
}
