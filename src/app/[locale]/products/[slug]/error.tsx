"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw, Package, LogIn } from "lucide-react";
import Link from "next/link";
import { ApiError } from "@/shared/lib/api";
import { useAuthModalStore } from "@/features/auth/store/useAuthModalStore";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");
  const openAuthModal = useAuthModalStore((s) => s.open);

  useEffect(() => {
    console.error("Product page error:", error);
  }, [error]);

  const isAuthError = error instanceof ApiError && error.status === 401;

  if (isAuthError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <LogIn className="mb-3 size-10 text-primary" />
        <h1 className="text-xl font-bold text-text-primary">
          {t("sessionExpired") ?? "Session expired"}
        </h1>
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          {t("sessionExpiredDesc") ?? "Please sign in to continue viewing this product."}
        </p>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => openAuthModal?.()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            <LogIn className="size-4" />
            {t("signIn") ?? "Sign in"}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
          >
            <Package className="size-4" />
            {t("browseProducts") ?? "Browse products"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertTriangle className="mb-3 size-10 text-red-400" />
      <h1 className="text-xl font-bold text-text-primary">
        {t("productErrorTitle") ?? "Product unavailable"}
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        {t("productErrorDesc") ?? "This product could not be loaded. It may have been removed or is temporarily unavailable."}
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
          <Package className="size-4" />
          {t("browseProducts") ?? "Browse products"}
        </Link>
      </div>
    </div>
  );
}
