/** Raw values accepted by the public contact endpoint (`POST /contacts`). */
export interface ContactValues {
  email: string;
  subject: string;
  message: string;
}

export type ContactField = keyof ContactValues;

/**
 * Field-level validation codes. The server action returns codes (never
 * user-facing copy) so the client can translate them for both locales.
 */
export type ContactFieldError =
  | "emailRequired"
  | "emailInvalid"
  | "emailTooLong"
  | "subjectRequired"
  | "subjectTooLong"
  | "messageRequired"
  | "messageTooShort"
  | "messageTooLong";

/** Form-level failures (not tied to a single input). */
export type ContactFormError = "rateLimited" | "network" | "server";

export interface ActionState {
  success: boolean;
  /** Echoed back so a failed submit never loses what the user typed. */
  values?: ContactValues;
  fieldErrors?: Partial<Record<ContactField, ContactFieldError>>;
  errorCode?: ContactFormError;
}
