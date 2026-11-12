/**
 * Canonical money formatting. Use everywhere prices are displayed instead of
 * manual toFixed + currency string concatenation (RTL/decimal correctness).
 *
 * Arabic locale always uses Eastern Arabic digits (٠١٢٣٤٥٦٧٨٩) via an
 * explicit `numberingSystem: "arab"` so Chrome/Firefox match Safari
 * (which renders `ar-*` with Arabic-Indic digits by default).
 */
const CURRENCY = "SAR";
const CURRENCY_DISPLAY: Record<string, string> = {
  en: "SAR",
  ar: "ر.س",
};

export interface FormatMoneyOptions {
  /** Symbol override (e.g. "$"). Defaults to the locale SAR label. */
  symbol?: string;
  /** Fraction digits override. Defaults to 2 (SAR uses 2 decimals). */
  decimalPlaces?: number;
}

export function formatNumber(
  amount: number | null | undefined,
  locale = "en",
  decimals = 2,
): string {
  const safe = Number.isFinite(amount) ? (amount as number) : 0;
  return safe.toLocaleString(locale === "ar" ? "ar-SA" : "en-SA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    numberingSystem: locale === "ar" ? "arab" : "latn",
  });
}

export function formatMoney(
  amount: number | null | undefined,
  locale = "en",
  opts?: FormatMoneyOptions,
): string {
  const decimals = opts?.decimalPlaces ?? 2;
  const formatted = formatNumber(amount, locale, decimals);
  return `${formatted} ${opts?.symbol ?? (CURRENCY_DISPLAY[locale] ?? "SAR")}`;
}

export const CURRENCY_CODE = CURRENCY;

/** Currency label for split int/decimal price layouts (e.g. ProductCard). */
export function currencyLabel(locale = "en", symbol?: string): string {
  return symbol ?? CURRENCY_DISPLAY[locale] ?? "SAR";
}
