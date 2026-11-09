/** Currency domain types (feature: currencies). */

import { currencySymbolFor } from "@/shared/utils/formatMoney";

export interface LocalizedText {
  en: string;
  ar: string;
}

/**
 * Backend is inconsistent: `/general/currencies` returns flat strings while
 * product payloads return `{en, ar}` objects. Accept both everywhere.
 */
export type MaybeLocalized = string | LocalizedText;

export function resolveLocalized(
  value: MaybeLocalized | undefined | null,
  locale = "en",
  fallback = "",
): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  return value[locale as keyof LocalizedText] ?? value.en ?? value.ar ?? fallback;
}

export interface Currency {
  id: number;
  code: string;
  name: MaybeLocalized;
  symbol: MaybeLocalized;
  country_name?: MaybeLocalized | null;
  numeric_code?: string;
  decimal_places: number;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  is_base: boolean;
  is_catalog: boolean;
  /** Display-currency units per 1 base-currency unit (e.g. KWD "0.221"). */
  effective_rate?: string | number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Per-product currency object returned by `/general/products*`.
 * Note: it carries no `decimal_places` — decimals are resolved from the
 * currencies list (matched by code) in `useDisplayCurrency`.
 */
export interface ProductCurrency {
  id?: number;
  code: string;
  name?: MaybeLocalized;
  symbol?: MaybeLocalized;
  country_name?: MaybeLocalized;
  icon?: string;
}

/** Resolved display currency: symbol text + fraction digits. */
export interface DisplayCurrency {
  code: string;
  symbol: string;
  decimalPlaces: number;
}

/**
 * Server-resolved currency snapshot, owned by the layout-level
 * `CurrencyProvider`. Everything is backend-driven: the default comes from
 * `/general/settings` (base/catalog code) + `/general/currencies`
 * (symbol/decimals) — never from a frontend constant.
 */
export interface CurrencyContextValue {
  /** All active currencies from `/general/currencies`. */
  currencies: Currency[];
  /** Backend base/catalog currency code from `/general/settings`. */
  baseCode: string;
  /** Whether users may pick a display currency (settings switch). */
  selectionEnabled: boolean;
  /** Server-resolved default display currency (always renderable). */
  defaultCurrency: DisplayCurrency;
}

/**
 * Pick the backend base currency for display: the code given by settings
 * when the list knows it, else the list's `is_base`/`is_catalog` entry.
 */
export function resolveBaseCurrency(
  list: Currency[],
  preferredCode?: string | null,
): Currency | null {
  if (list.length === 0) return null;
  const code = preferredCode?.trim().toUpperCase() || undefined;
  return (
    (code && list.find((c) => c.code === code)) ||
    list.find((c) => c.is_base) ||
    list.find((c) => c.is_catalog) ||
    list[0]
  );
}

/** Display metadata (English symbol + decimals) for a resolved currency. */
export function displayCurrencyOf(currency: Currency): DisplayCurrency {
  return {
    code: currency.code,
    symbol: currencySymbolFor(
      currency.code,
      resolveLocalized(currency.symbol, "en", ""),
    ),
    decimalPlaces: Number.isFinite(currency.decimal_places)
      ? currency.decimal_places
      : 2,
  };
}

/**
 * Defensive fallback when the currencies list is unavailable: the code from
 * settings is still backend-defined; the label falls back to the code.
 */
export function displayCurrencyFromCode(code: string): DisplayCurrency {
  return {
    code,
    symbol: currencySymbolFor(code),
    decimalPlaces: 2,
  };
}
