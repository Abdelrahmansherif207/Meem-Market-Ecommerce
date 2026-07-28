"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { ApiError } from "@/shared/lib/api";
import { useAuthModalStore } from "@/features/auth/store/useAuthModalStore";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");
  const openAuthModal = useAuthModalStore((s) => s.open);

  useEffect(() => {
    console.error("Auth page error:", error);
  }, [error]);

  const isAuthError = error instanceof ApiError && error.status === 401;

  if (isAuthError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-3 size-10 text-red-400" />
        <h1 className="text-xl font-bold text-text-primary">
          {t("sessionExpired") ?? "Session expired"}
        </h1>
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          {error.message}
        </p>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => { openAuthModal?.(); reset(); }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            <RefreshCw className="size-4" />
            {t("signIn") ?? "Sign in"}
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

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertTriangle className="mb-3 size-10 text-red-400" />
      <h1 className="text-xl font-bold text-text-primary">
        {t("authErrorTitle") ?? "Authentication service unavailable"}
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
