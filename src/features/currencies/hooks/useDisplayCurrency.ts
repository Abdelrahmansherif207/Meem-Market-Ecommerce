"use client";

import { currencySymbolFor } from "@/shared/utils/formatMoney";
import { useCurrencySnapshot } from "../components/CurrencyProvider";
import { useCurrencyStore } from "../store/useCurrencyStore";
import {
  resolveLocalized,
  type DisplayCurrency,
  type ProductCurrency,
} from "../types";

/**
 * Resolve the currency to display — backend-driven. Priority:
 * 1. per-product currency from the API payload (label from the payload,
 *    decimals matched against the backend currencies list, which product
 *    payloads don't carry),
 * 2. the user's selected currency, only while `currency_selection_enabled`
 *    is true — stale saved codes are ignored otherwise,
 * 3. the server-resolved default from `/general/settings` +
 *    `/general/currencies`.
 *
 * Prices are always shown in English: symbols resolve through the `en`
 * locale and Arabic-localized symbols fall back to the English list symbol
 * or the currency code itself, in every locale. There is no hardcoded
 * frontend currency default.
 */
export function useDisplayCurrency(
  productCurrency?: ProductCurrency | null,
): DisplayCurrency {
  const snapshot = useCurrencySnapshot();
  const selectedCode = useCurrencyStore((s) => s.selectedCode);
  const byCode = useCurrencyStore((s) => s.byCode);

  // 1. Payload currency wins for its own amounts.
  const productCode = productCurrency?.code?.trim().toUpperCase();
  if (productCode) {
    const byCodeMeta = byCode[productCode];
    const listCurrency = snapshot?.currencies.find(
      (c) => c.code === productCode,
    );
    const decimalPlaces =
      byCodeMeta?.decimalPlaces ??
      (listCurrency && Number.isFinite(listCurrency.decimal_places)
        ? listCurrency.decimal_places
        : 2);
    // English symbol chain: payload → list → code. Arabic payload symbols
    // (e.g. "ر.ق") are rejected and fall back to the list/code label.
    const listSymbol = byCodeMeta?.symbol ?? (listCurrency
      ? currencySymbolFor(
          productCode,
          resolveLocalized(listCurrency.symbol, "en", ""),
        )
      : undefined);
    const symbol = currencySymbolFor(
      productCode,
      resolveLocalized(productCurrency?.symbol, "en", "") || listSymbol,
    );
    return { code: productCode, symbol, decimalPlaces };
  }

  // 2. Selected currency — honored only while the store allows selection.
  const knownSelected = selectedCode ? byCode[selectedCode] : undefined;
  if (snapshot?.selectionEnabled && knownSelected) {
    return {
      code: selectedCode,
      symbol: knownSelected.symbol,
      decimalPlaces: knownSelected.decimalPlaces,
    };
  }

  // 3. Server-resolved backend default (base/catalog currency).
  if (snapshot) return snapshot.defaultCurrency;

  // Outside the provider (defensive): fall back to whatever the store still
  // knows, then to an empty label — never to a hardcoded currency.
  if (knownSelected) {
    return {
      code: selectedCode,
      symbol: knownSelected.symbol,
      decimalPlaces: knownSelected.decimalPlaces,
    };
  }
  if (selectedCode) {
    return {
      code: selectedCode,
      symbol: currencySymbolFor(selectedCode),
      decimalPlaces: 2,
    };
  }
  return { code: "", symbol: "", decimalPlaces: 2 };
}

