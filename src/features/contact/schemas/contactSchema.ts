import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(255, "Name must be at most 255 characters."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .max(255, "Email must be at most 255 characters."),
  subject: z
    .string()
    .min(1, "Subject is required.")
    .max(255, "Subject must be at most 255 characters."),
  message: z
    .string()
    .min(3, "Message must be at least 3 characters.")
    .max(5000, "Message must be at most 5000 characters."),
});

export function validateContactForm(data: ContactFormData): Record<string, string> {
  const result = contactSchema.safeParse(data);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path[0] as string;
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
