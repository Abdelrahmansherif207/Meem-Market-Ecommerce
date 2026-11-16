"use client";

import { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartFeedbackStore } from "../store/useCartFeedbackStore";

const AUTO_DISMISS_MS = 6000;

/**
 * Single global surface for failed cart mutations. Rendered once in the
 * locale layout so every card / PDP / sticky bar reports the same way.
 */
export function CartFeedbackToast() {
  const feedback = useCartFeedbackStore((s) => s.feedback);
  const dismiss = useCartFeedbackStore((s) => s.dismiss);
  const t = useTranslations("cartPage.feedback");

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [feedback, dismiss]);

  if (!feedback) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-28 z-[210] flex justify-center lg:inset-x-auto lg:bottom-6 lg:end-4 lg:justify-end">
      <div
        role="alert"
        aria-live="assertive"
        className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-2xl shadow-black/10"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
          <AlertCircle className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">{feedback.title}</p>
          <p className="mt-0.5 text-xs text-text-secondary">{feedback.message}</p>
        </div>
        <button
          type="button"
          aria-label={t("dismiss")}
          onClick={dismiss}
          className="shrink-0 rounded-full p-1 text-text-secondary/60 transition-colors hover:bg-surface hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
