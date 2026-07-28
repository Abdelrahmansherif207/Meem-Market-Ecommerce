"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertTriangle className="mb-3 size-10 text-red-400" />
      <h1 className="text-xl font-bold text-text-primary">
        {t("genericTitle") ?? "Something went wrong"}
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        {error.message}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          <RefreshCw className="size-4" />
          {t("retry") ?? "Try again"}
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
        >
          <Home className="size-4" />
          {t("goHome") ?? "Go home"}
        </Link>
      </div>
    </div>
  );
}
