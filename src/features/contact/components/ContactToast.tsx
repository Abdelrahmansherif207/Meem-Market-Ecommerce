"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";

export type ContactToastData = {
  kind: "success" | "error";
  title: string;
  message?: string;
};

const AUTO_DISMISS_MS = 6000;

/**
 * Page-scoped toast for the contact form. Mirrors the global cart/notification
 * toast styling so the surface feels native to the storefront.
 */
export function ContactToast({
  toast,
  onDismiss,
}: {
  toast: ContactToastData | null;
  onDismiss: () => void;
}) {
  const t = useTranslations("contact");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.kind === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[220] flex justify-center lg:inset-x-auto lg:bottom-6 lg:end-4 lg:justify-end">
      <div
        role={isSuccess ? "status" : "alert"}
        aria-live={isSuccess ? "polite" : "assertive"}
        className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-2xl shadow-black/10"
      >
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            isSuccess
              ? "bg-success-surface text-success"
              : "bg-error/10 text-error",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-xs text-text-secondary">{toast.message}</p>
          )}
        </div>
        <button
          type="button"
          aria-label={t("toast.dismiss")}
          onClick={onDismiss}
          className="shrink-0 rounded-full p-1 text-text-secondary/60 transition-colors hover:bg-surface hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
