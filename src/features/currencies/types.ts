/** Currency domain types (feature: currencies). */

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
