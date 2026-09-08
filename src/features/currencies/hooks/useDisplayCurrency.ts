"use client";

import { useLocale } from "next-intl";
import { useCurrencyStore } from "../store/useCurrencyStore";
import {
  resolveLocalized,
  type DisplayCurrency,
  type ProductCurrency,
} from "../types";

/** Legacy labels used until the currencies list seeds the store. */
const LEGACY_SYMBOL: Record<string, string> = {
  en: "K.D",
  ar: "د.ك",
};

/**
 * Resolve the currency to display. Priority:
 * 1. per-product currency from the API (matched against the seeded list for
 *    `decimal_places`, which product payloads don't carry),
 * 2. the user's selected currency from the store,
 * 3. legacy locale default (K.D / د.ك, 2 decimals — preserves old rendering).
 */
export function useDisplayCurrency(
  productCurrency?: ProductCurrency | null,
): DisplayCurrency {
  const locale = useLocale();
  const selectedCode = useCurrencyStore((s) => s.selectedCode);
  const byCode = useCurrencyStore((s) => s.byCode);

  const code = productCurrency?.code || selectedCode || "KWD";
  const known = byCode[code];

  const symbol =
    resolveLocalized(productCurrency?.symbol, locale, "") ||
    known?.symbol ||
    LEGACY_SYMBOL[locale] ||
    LEGACY_SYMBOL.en;

  return {
    code,
    symbol,
    decimalPlaces: known?.decimalPlaces ?? 2,
  };
}
