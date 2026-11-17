"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useDisplayCurrency } from "@/features/currencies";
import { formatMoney } from "@/shared/utils/formatMoney";
import { cn } from "@/shared/utils/cn";

interface MinimumOrderProgressProps {
  /** Cart subtotal in the display currency. */
  subtotal: number;
  minimumOrderAmount: number;
  className?: string;
  /** Section footer variant: one line + bar, no amount scale. */
  compact?: boolean;
}

/**
 * Progress toward the store's minimum order value.
 *
 * Purely presentational: the checkout button remains the source of truth for
 * whether an order can be placed. The bar gives shoppers a clear, decorative
 * answer to "how much more do I need to add?" instead of a bare text line.
 */
export function MinimumOrderProgress({
  subtotal,
  minimumOrderAmount,
  className,
  compact = false,
}: MinimumOrderProgressProps) {
  const t = useTranslations("cartPage");
  const locale = useLocale();
  const displayCurrency = useDisplayCurrency();

  if (!Number.isFinite(minimumOrderAmount) || minimumOrderAmount <= 0) {
    return null;
  }

  const safeSubtotal = Number.isFinite(subtotal) ? Math.max(0, subtotal) : 0;
  const remaining = Math.max(0, minimumOrderAmount - safeSubtotal);
  const reached = remaining <= 0.005;
  const progress = Math.min(1, safeSubtotal / minimumOrderAmount);
  const percent = Math.round(progress * 100);

  const money = (amount: number) =>
    formatMoney(amount, locale, {
      symbol: displayCurrency.symbol,
      decimalPlaces: displayCurrency.decimalPlaces,
    });

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <p
          className={cn(
            "flex items-center gap-1.5 text-xs leading-relaxed",
            reached ? "font-semibold text-success" : "text-text-secondary",
          )}
        >
          {reached ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          ) : (
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          )}
          <span>
            {reached
              ? t("minimumReached")
              : t("minimumRemaining", { amount: money(remaining) })}
          </span>
        </p>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-text-secondary">
          {percent}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={t("minimumProgressLabel", {
          minimum: money(minimumOrderAmount),
        })}
        aria-valuemin={0}
        aria-valuemax={minimumOrderAmount}
        aria-valuenow={Math.min(safeSubtotal, minimumOrderAmount)}
        className="relative h-2 w-full overflow-hidden rounded-full bg-border/60"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            reached
              ? "bg-success"
              : "bg-gradient-to-r from-primary via-primary to-accent",
          )}
          style={{ width: `${reached ? 100 : Math.max(2, progress * 100)}%` }}
        />
        {!reached && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 start-0 w-full animate-pulse bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.35)_45%,transparent_70%)] motion-reduce:animate-none"
          />
        )}
      </div>

      {!compact && (
        <div className="flex items-center justify-between gap-3 text-xs tabular-nums text-text-secondary">
          <span>{money(safeSubtotal)}</span>
          <span>{money(minimumOrderAmount)}</span>
        </div>
      )}
    </div>
  );
}
