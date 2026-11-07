/**
 * Canonical money formatting. Use everywhere prices are displayed instead of
 * manual toFixed + currency string concatenation (RTL/decimal correctness).
 *
 * Prices are always rendered in English regardless of the active locale:
 * Latin digits (0-9) and the English currency label ("K.D"). This keeps
 * prices readable and consistent on Arabic and English pages alike.
 */
const CURRENCY = "KWD";
export const CURRENCY_SYMBOL = "K.D";

/** Arabic-script characters — used to reject localized symbols from the API. */
const ARABIC_SCRIPT = /[\u0600-\u06FF]/;

export interface FormatMoneyOptions {
  /** Symbol override (e.g. "$"). Defaults to the English KWD label. */
  symbol?: string;
  /** Fraction digits override (e.g. 3 for KWD). Defaults to 2. */
  decimalPlaces?: number;
}

/**
 * Force a display symbol to English. Backend payloads sometimes carry the
 * localized Arabic symbol (e.g. "د.ك") even when English is requested; those
 * fall back to the provided label (currency code or "K.D").
 */
export function englishCurrencySymbol(
  symbol: string | null | undefined,
  fallback: string = CURRENCY_SYMBOL,
): string {
  const value = symbol?.trim();
  if (!value || ARABIC_SCRIPT.test(value)) return fallback;
  return value;
}

/**
 * English display symbol for a currency code. KWD always uses the English
 * "K.D" label; other currencies fall back to their code when the API only
 * returns an Arabic-localized symbol.
 */
export function currencySymbolFor(
  code: string | null | undefined,
  symbol?: string | null,
): string {
  const codeText = code?.trim();
  const fallback = englishCurrencySymbol(
    codeText?.toUpperCase() === CURRENCY ? CURRENCY_SYMBOL : codeText,
    CURRENCY_SYMBOL,
  );
  return englishCurrencySymbol(symbol, fallback);
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
  return `${formatted} ${opts?.symbol ?? CURRENCY_SYMBOL}`;
}

export const CURRENCY_CODE = CURRENCY;

/** Currency label for split int/decimal price layouts (e.g. ProductCard). */
export function currencyLabel(locale = "en", symbol?: string): string {
  // Kept for call-site compatibility; labels are always English.
  void locale;
  return englishCurrencySymbol(symbol);
}
