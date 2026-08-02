"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import { isServerDownError } from "@/shared/lib/errors";

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

  const serverDown = isServerDownError(error);

  return (
    <div className="flex flex-1 flex-col justify-center py-12">
      <EmptyState
        variant="serverError"
        title={
          serverDown
            ? (t("serverDownTitle") ?? "We can't reach our servers")
            : (t("genericTitle") ?? "Something went wrong")
        }
        description={
          serverDown
            ? (t("serverDownDesc") ?? "Something went wrong on our end.")
            : undefined
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
              <Home className="size-4" />
              {t("goHome") ?? "Go home"}
            </Link>
          </>
        }
      />
    </div>
  );
}
