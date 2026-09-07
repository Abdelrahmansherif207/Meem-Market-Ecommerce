"use client";

import { useLocale } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

interface PriceProps {
  /** Amount in catalog currency. Null/undefined/NaN safely renders as 0. */
  amount: number | null | undefined;
  /** Extra classes for size/weight/color (e.g. line-through for was-prices). */
  className?: string;
  /** Optional prefix rendered inside the same nowrap span (e.g. "-"). */
  prefix?: string;
  title?: string;
}

/**
 * Canonical price display — use everywhere instead of manual
 * `toFixed(2) + currency` concatenation. Locale-aware (digits, grouping,
 * currency label), always horizontal and never wraps mid-price.
 */
export function Price({ amount, className, prefix, title }: PriceProps) {
  const locale = useLocale();
  const text = formatMoney(amount, locale);

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
