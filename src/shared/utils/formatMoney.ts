/**
 * Canonical money formatting. Use everywhere prices are displayed instead of
 * manual toFixed + currency string concatenation (RTL/decimal correctness).
 *
 * Money is always rendered in English regardless of the active locale:
 * Latin digits, grouping and separators. Currency labels never come from
 * here — the display currency is resolved from backend data
 * (`/general/settings` + `/general/currencies`, or a payload's own
 * `currency` metadata) and passed in by the caller.
 */

/** Arabic-script characters — used to reject localized symbols from the API. */
const ARABIC_SCRIPT = /[\u0600-\u06FF]/;

export interface FormatMoneyOptions {
  /** Display symbol, resolved by the caller from backend currency data. */
  symbol?: string;
  /** Fraction digits override. Defaults to 2. */
  decimalPlaces?: number;
}

/**
 * Force a display symbol to English. Backend payloads sometimes carry the
 * localized Arabic symbol (e.g. "د.ك") even when English is requested; those
 * fall back to the provided label (the English list symbol or the code).
 */
export function englishCurrencySymbol(
  symbol: string | null | undefined,
  fallback: string = "",
): string {
  const value = symbol?.trim();
  if (!value || ARABIC_SCRIPT.test(value)) return fallback;
  return value;
}

/**
 * English display symbol for a currency code. When the API symbol is missing
 * or Arabic-localized, the (uppercased) code itself is used — the label is
 * always backend-defined, never a frontend default.
 */
export function currencySymbolFor(
  code: string | null | undefined,
  symbol?: string | null,
): string {
  const codeText = code?.trim().toUpperCase();
  return englishCurrencySymbol(symbol, codeText ?? "");
}

export function formatNumber(
  amount: number | null | undefined,
  locale = "en",
  decimals = 2,
): string {
  const safe = Number.isFinite(amount) ? (amount as number) : 0;
  // Prices always use English digits and separators, in every locale.
  void locale;
  return safe.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    numberingSystem: "latn",
  });
}

export function formatMoney(
  amount: number | null | undefined,
  locale = "en",
  opts?: FormatMoneyOptions,
): string {
  const decimals = opts?.decimalPlaces ?? 2;
  const formatted = formatNumber(amount, locale, decimals);
  const symbol = opts?.symbol?.trim();
  return symbol ? `${formatted} ${symbol}` : formatted;
}

/** Currency label for split int/decimal price layouts (e.g. ProductCard). */
export function currencyLabel(locale = "en", symbol?: string): string {
  // Kept for call-site compatibility; labels are always English.
  void locale;
  return englishCurrencySymbol(symbol);
}
