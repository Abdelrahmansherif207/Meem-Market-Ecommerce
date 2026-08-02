"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw, Package, LogIn } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import { isServerDownError } from "@/shared/lib/errors";
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
      <div className="flex flex-1 flex-col justify-center py-12">
        <EmptyState
          title={t("sessionExpired") ?? "Session expired"}
          description={t("sessionExpiredDesc") ?? "Please sign in to continue viewing this product."}
          actions={
            <>
              <button
                onClick={() => openAuthModal?.()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
              >
                <LogIn className="size-4" />
                {t("signIn") ?? "Sign in"}
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <Package className="size-4" />
                {t("browseProducts") ?? "Browse products"}
              </Link>
            </>
          }
        />
      </div>
    );
  }

  const serverDown = isServerDownError(error);

  return (
    <div className="flex flex-1 flex-col justify-center py-12">
      <EmptyState
        variant="serverError"
        title={
          serverDown
            ? (t("serverDownTitle") ?? "We can't reach our servers")
            : (t("productErrorTitle") ?? "Product unavailable")
        }
        description={
          serverDown
            ? (t("serverDownDesc") ?? "Something went wrong on our end.")
            : (t("productErrorDesc") ?? "This product could not be loaded.")
        }
        actions={
          <>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
            >
              <RefreshCw className="size-4" />
              {t("retry") ?? "Try again"}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <Package className="size-4" />
              {t("browseProducts") ?? "Browse products"}
            </Link>
          </>
        }
      />
    </div>
  );
}
