/**
 * Canonical money formatting. Use everywhere prices are displayed instead of
 * manual toFixed + currency string concatenation (RTL/decimal correctness).
 */
const CURRENCY = "KWD";
const CURRENCY_DISPLAY: Record<string, string> = {
  en: "K.D",
  ar: "د.ك",
};

export interface FormatMoneyOptions {
  /** Symbol override (e.g. "$"). Defaults to the locale KWD label. */
  symbol?: string;
  /** Fraction digits override (e.g. 3 for KWD). Defaults to 2. */
  decimalPlaces?: number;
}

export function formatMoney(
  amount: number | null | undefined,
  locale = "en",
  opts?: FormatMoneyOptions,
): string {
  const safe = Number.isFinite(amount) ? (amount as number) : 0;
  const decimals = opts?.decimalPlaces ?? 2;
  const formatted = safe.toLocaleString(locale === "ar" ? "ar-KW" : "en-KW", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted} ${opts?.symbol ?? (CURRENCY_DISPLAY[locale] ?? "K.D")}`;
}

export const CURRENCY_CODE = CURRENCY;

/** Currency label for split int/decimal price layouts (e.g. ProductCard). */
export function currencyLabel(locale = "en", symbol?: string): string {
  return symbol ?? CURRENCY_DISPLAY[locale] ?? "K.D";
}
