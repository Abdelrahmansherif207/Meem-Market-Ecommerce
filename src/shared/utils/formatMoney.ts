/**
 * Canonical money formatting. Use everywhere prices are displayed instead of
 * manual toFixed + currency string concatenation (RTL/decimal correctness).
 */
const CURRENCY = "KWD";
const CURRENCY_DISPLAY: Record<string, string> = {
  en: "K.D",
  ar: "د.ك",
};

export function formatMoney(amount: number | null | undefined, locale = "en"): string {
  const safe = Number.isFinite(amount) ? (amount as number) : 0;
  const formatted = safe.toLocaleString(locale === "ar" ? "ar-KW" : "en-KW", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${CURRENCY_DISPLAY[locale] ?? "K.D"}`;
}

export const CURRENCY_CODE = CURRENCY;

/** Currency label for split int/decimal price layouts (e.g. ProductCard). */
export function currencyLabel(locale = "en"): string {
  return CURRENCY_DISPLAY[locale] ?? "K.D";
}
