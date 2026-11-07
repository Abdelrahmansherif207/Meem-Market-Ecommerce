"use client";

import { currencySymbolFor } from "@/shared/utils/formatMoney";
import { useCurrencyStore } from "../store/useCurrencyStore";
import {
  resolveLocalized,
  type DisplayCurrency,
  type ProductCurrency,
} from "../types";

/**
 * Resolve the currency to display. Priority:
 * 1. per-product currency from the API (matched against the seeded list for
 *    `decimal_places`, which product payloads don't carry),
 * 2. the user's selected currency from the store,
 * 3. English KWD default ("K.D", 2 decimals).
 *
 * Prices are always shown in English: symbols resolve through the `en`
 * locale and any Arabic-localized symbol falls back to `K.D`/the currency
 * code, in every locale.
 */
export function useDisplayCurrency(
  productCurrency?: ProductCurrency | null,
): DisplayCurrency {
  const selectedCode = useCurrencyStore((s) => s.selectedCode);
  const byCode = useCurrencyStore((s) => s.byCode);

  const code = productCurrency?.code || selectedCode || "KWD";
  const known = byCode[code];

  const symbol = currencySymbolFor(
    code,
    resolveLocalized(productCurrency?.symbol, "en", "") ||
      known?.symbol,
  );

  return {
    code,
    symbol,
    decimalPlaces: known?.decimalPlaces ?? 2,
  };
}
