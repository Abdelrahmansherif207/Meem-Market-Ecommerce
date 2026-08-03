"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Home } from "lucide-react";
import Link from "next/link";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";
import { isServerDownError } from "@/shared/lib/errors";
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
    console.error("Auth page error:", error, error.digest ? `digest: ${error.digest}` : "");
  }, [error]);

  const isAuthError = error instanceof ApiError && error.status === 401;

  if (isAuthError) {
    return (
      <div className="flex flex-1 flex-col justify-center py-12">
        <ErrorState
          variant="generic"
          title={t("sessionExpired") ?? "Session expired"}
          description={error.message}
          actions={
            <>
              <RetryButton
                label={t("signIn") ?? "Sign in"}
                onClick={() => {
                  openAuthModal?.();
                  reset();
                }}
              />
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <Home className="size-4" />
                {t("goHome") ?? "Go home"}
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
      <ErrorState
        variant="serverError"
        title={
          serverDown
            ? (t("serverDownTitle") ?? "We can't reach our servers")
            : (t("authErrorTitle") ?? "Authentication service unavailable")
        }
        description={
          serverDown
            ? (t("serverDownDesc") ?? "Something went wrong on our end.")
            : undefined
        }
        actions={
          <>
            <RetryButton label={t("retry") ?? "Try again"} onClick={reset} />
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <Home className="size-4" />
              {t("goHome") ?? "Go home"}
            </Link>
          </>
        }
      />
    </div>
  );
}
