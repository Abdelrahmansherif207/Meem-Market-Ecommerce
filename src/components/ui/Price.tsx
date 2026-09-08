"use client";

import { useLocale } from "next-intl";
import { cn } from "@/shared/utils/cn";
import {
  useDisplayCurrency,
  type ProductCurrency,
} from "@/features/currencies";

interface PriceProps {
  /** Amount in the effective currency (already converted by the Backend). */
  amount: number | null | undefined;
  /** Extra classes for size/weight/color (e.g. line-through for was-prices). */
  className?: string;
  /** Optional prefix rendered inside the same nowrap span (e.g. "-"). */
  prefix?: string;
  title?: string;
  /**
   * Per-product currency object or code. When omitted, the selected
   * currency from the store is used (which matches the `X-Currency`
   * header the values were converted with). Callers showing catalog-fixed
   * constants should keep rendering without conversion concerns — but
   * note the label still follows the selection.
   */
  currency?: string | ProductCurrency;
  /** Fraction digits override. Defaults to the currency's decimal places. */
  decimals?: number;
}

/**
 * Canonical price display — use everywhere instead of manual
 * `toFixed(2) + currency` concatenation. Locale-aware (digits, grouping,
 * currency label), always horizontal and never wraps mid-price.
 */
export function Price({
  amount,
  className,
  prefix,
  title,
  currency,
  decimals,
}: PriceProps) {
  const locale = useLocale();
  const display = useDisplayCurrency(
    typeof currency === "object"
      ? currency
      : currency
        ? ({ code: currency } as ProductCurrency)
        : undefined,
  );
  const fractionDigits = decimals ?? display.decimalPlaces;
  const safe = Number.isFinite(amount) ? (amount as number) : 0;
  const formatted = safe.toLocaleString(locale === "ar" ? "ar-KW" : "en-KW", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  const text = `${formatted} ${display.symbol}`;

  return (
    <span
      className={cn("whitespace-nowrap tabular-nums", className)}
      title={title ?? (prefix ? `${prefix}${text}` : text)}
    >
      {prefix}
      {text}
    </span>
  );
}
