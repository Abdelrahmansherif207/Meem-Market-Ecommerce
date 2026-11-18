import { z } from "zod";
import type { ContactField, ContactFieldError, ContactValues } from "../types";

/**
 * Mirror of the backend rules for `POST /contacts`:
 * name `required|max:255`, email `email|max:255`, subject `string|max:255`,
 * message `min:3|max:5000`. Issue messages are translation keys consumed by
 * the client.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "nameRequired")
    .max(255, "nameTooLong"),
  email: z
    .string()
    .trim()
    .min(1, "emailRequired")
    .email("emailInvalid")
    .max(255, "emailTooLong"),
  subject: z
    .string()
    .trim()
    .min(1, "subjectRequired")
    .max(255, "subjectTooLong"),
  message: z
    .string()
    .trim()
    .min(1, "messageRequired")
    .min(3, "messageTooShort")
    .max(5000, "messageTooLong"),
});

export function validateContactForm(
  data: ContactValues,
): Partial<Record<ContactField, ContactFieldError>> {
  const result = contactSchema.safeParse(data);
  if (result.success) return {};

  const errors: Partial<Record<ContactField, ContactFieldError>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ContactField;
    if (!errors[field]) {
      errors[field] = issue.message as ContactFieldError;
    }
  }
  return errors;
}
