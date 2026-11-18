"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Send } from "lucide-react";
import { contactAction } from "../actions/contactAction";
import { ContactToast, type ContactToastData } from "./ContactToast";
import type { ActionState } from "../types";

const fieldClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/60 focus:border-primary focus:ring-1 focus:ring-primary aria-invalid:border-error";
const labelClass = "text-sm font-medium text-text-primary";
const errorClass = "text-xs text-error";

export default function ContactForm() {
  const t = useTranslations("contact");
  const [state, setState] = useState<ActionState | null>(null);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<ContactToastData | null>(null);
  // Remount the uncontrolled form after a successful submit to clear it.
  const [formKey, setFormKey] = useState(0);

  const dismissToast = useCallback(() => setToast(null), []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    setPending(true);
    try {
      const result = await contactAction(state, formData);
      setState(result);

      if (result.success) {
        setFormKey((key) => key + 1);
        setToast({
          kind: "success",
          title: t("toast.successTitle"),
          message: t("toast.successMessage"),
        });
      } else if (result.errorCode) {
        setToast({
          kind: "error",
          title: t("toast.errorTitle"),
          message: t(`errors.${result.errorCode}`),
        });
      }
    } catch {
      // The server action itself failed (network/deploy issue) — never leave
      // the user without feedback.
      setToast({
        kind: "error",
        title: t("toast.errorTitle"),
        message: t("errors.server"),
      });
    } finally {
      setPending(false);
    }
  }

  const values = state?.values;

  const fieldError = (field: "email" | "subject" | "message") => {
    const code = state?.fieldErrors?.[field];
    return code ? t(`errors.${code}`) : undefined;
  };

  const emailError = fieldError("email");
  const subjectError = fieldError("subject");
  const messageError = fieldError("message");

  return (
    <>
      <form
        key={formKey}
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={255}
            autoComplete="email"
            defaultValue={values?.email ?? ""}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "email-error" : undefined}
            placeholder={t("emailPlaceholder")}
            className={fieldClass}
          />
          {emailError && (
            <p id="email-error" className={errorClass}>
              {emailError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="subject" className={labelClass}>
            {t("subject")}
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            maxLength={255}
            defaultValue={values?.subject ?? ""}
            aria-invalid={Boolean(subjectError)}
            aria-describedby={subjectError ? "subject-error" : undefined}
            placeholder={t("subjectPlaceholder")}
            className={fieldClass}
          />
          {subjectError && (
            <p id="subject-error" className={errorClass}>
              {subjectError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className={labelClass}>
            {t("message")}
          </label>
          <textarea
            id="message"
            name="message"
            required
            minLength={3}
            maxLength={5000}
            rows={6}
            defaultValue={values?.message ?? ""}
            aria-invalid={Boolean(messageError)}
            aria-describedby={messageError ? "message-error" : undefined}
            placeholder={t("messagePlaceholder")}
            className={`${fieldClass} min-h-32 resize-y`}
          />
          {messageError && (
            <p id="message-error" className={errorClass}>
              {messageError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t("sending")}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden />
              {t("send")}
            </>
          )}
        </button>
      </form>

      <ContactToast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
