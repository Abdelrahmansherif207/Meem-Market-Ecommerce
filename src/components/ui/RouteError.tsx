"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Home } from "lucide-react";
import Link from "next/link";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";
import { isServerDownError } from "@/shared/lib/errors";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  logLabel: string;
}

/**
 * Shared page-level error presentation. Reuse in any error.tsx:
 * export default (props) => <RouteError {...props} logLabel="Wishlist" />;
 */
export function RouteError({ error, reset, logLabel }: RouteErrorProps) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error(`${logLabel} page error:`, error, error.digest ? `digest: ${error.digest}` : "");
  }, [error, logLabel]);

  const serverDown = isServerDownError(error);

  return (
    <div className="flex flex-1 flex-col justify-center py-12">
      <ErrorState
        variant="serverError"
        title={serverDown ? t("serverDownTitle") : t("genericErrorTitle")}
        description={serverDown ? t("serverDownDesc") : t("genericErrorDesc")}
        actions={
          <>
            <RetryButton label={t("retry")} onClick={reset} />
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <Home className="size-4" aria-hidden />
              {t("goHome")}
            </Link>
          </>
        }
      />
    </div>
  );
}
