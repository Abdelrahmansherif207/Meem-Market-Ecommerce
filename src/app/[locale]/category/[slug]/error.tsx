"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Home } from "lucide-react";
import Link from "next/link";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";
import { isServerDownError } from "@/shared/lib/errors";

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("Category page error:", error, error.digest ? `digest: ${error.digest}` : "");
  }, [error]);

  const serverDown = isServerDownError(error);

  return (
    <div className="flex flex-1 flex-col justify-center py-12">
      <ErrorState
        variant="serverError"
        title={
          serverDown
            ? (t("serverDownTitle") ?? "We can't reach our servers")
            : (t("categoryErrorTitle") ?? "Category unavailable")
        }
        description={
          serverDown
            ? (t("serverDownDesc") ?? "Something went wrong on our end.")
            : (t("categoryErrorDesc") ?? "This category could not be loaded. Please try again.")
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
