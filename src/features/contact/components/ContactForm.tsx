"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { contactAction } from "../actions/contactAction";

export default function ContactForm() {
  const t = useTranslations("contact");
  const [state, formAction, pending] = useActionState(contactAction, null);
  const payload = state?.payload;

  if (state?.success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="rounded-full bg-green-100 p-4">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-medium text-text-primary">{t("success")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 w-full max-w-xl mx-auto">
      {state?.message && !state?.success && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-text-primary">
          {t("name")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={payload?.name || ""}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          placeholder={t("namePlaceholder")}
        />
        {state?.fieldErrors?.name && (
          <p className="text-xs text-red-500">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-text-primary">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={payload?.email || ""}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          placeholder={t("emailPlaceholder")}
        />
        {state?.fieldErrors?.email && (
          <p className="text-xs text-red-500">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-sm font-medium text-text-primary">
          {t("subject")}
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          defaultValue={payload?.subject || ""}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          placeholder={t("subjectPlaceholder")}
        />
        {state?.fieldErrors?.subject && (
          <p className="text-xs text-red-500">{state.fieldErrors.subject}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-text-primary">
          {t("message")}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          defaultValue={payload?.message || ""}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y min-h-[120px]"
          placeholder={t("messagePlaceholder")}
        />
        {state?.fieldErrors?.message && (
          <p className="text-xs text-red-500">{state.fieldErrors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t("sending")}
          </>
        ) : (
          t("send")
        )}
      </button>
    </form>
  );
}
