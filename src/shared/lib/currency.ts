import { CURRENCY_STORAGE_KEY } from "@/shared/constants/storageKeys";

/**
 * Guest currency transport — `X-Currency` request header.
 *
 * The Frontend owns the selected value; the Backend owns validation
 * (`exists + is_active`), effective resolution
 * (`UserPreference > X-Currency > Catalog`), conversion, and the
 * `currency` metadata in responses. No currency cookie is set or read.
 */

/** Exact header name to send (case-insensitive on the wire). */
export const CURRENCY_HEADER = "X-Currency";

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

/**
 * Normalize a candidate currency code. Returns the uppercase 3-letter
 * code, or `undefined` when missing/invalid — callers must then omit the
 * header so the Backend falls back to the catalog currency (never an error).
 */
export function normalizeCurrencyCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const code = value.trim().toUpperCase();
  return CURRENCY_CODE_PATTERN.test(code) ? code : undefined;
}

/**
 * Runtime lock for stores with currency selection disabled. When set, it
 * replaces any stale persisted picker value for outgoing `X-Currency`
 * headers, so the backend base currency always wins until selection is
 * re-enabled. Owned by the layout-level CurrencyProvider.
 */
let lockedClientCurrency: string | undefined;

export function setLockedClientCurrency(
  code: string | null | undefined,
): void {
  lockedClientCurrency = normalizeCurrencyCode(code);
}

/**
 * Client-only read of the picker's persisted UI preference (a plain string,
 * never a second source of truth). Returns `undefined` on the server, when
 * selection is locked to the backend base currency, when nothing is stored,
 * or when the stored value is invalid.
 */
export function getStoredClientCurrency(): string | undefined {
  if (typeof window === "undefined") return undefined;
  if (lockedClientCurrency) return lockedClientCurrency;
  try {
    const raw = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { state?: { selectedCode?: unknown } };
    return normalizeCurrencyCode(parsed?.state?.selectedCode);
  } catch {
    return undefined;
  }
}
