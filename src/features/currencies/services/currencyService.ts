import { apiFetch } from "@/shared/lib/api";
import { normalizeCurrencyCode } from "@/shared/lib/currency";
import type { ApiResponse } from "@/shared/types";
import type { Currency } from "../types";

/**
 * Currencies API (guest currency travels via the `X-Currency` header —
 * no currency cookie is set or read anywhere).
 *
 * - List: `GET /general/currencies` → `{ data: Currency[] }` (flat array).
 *   Neither endpoint requires auth.
 * - Select: `POST /general/currencies/select` with JSON body
 *   `{ currency_code }`. Emits no `Set-Cookie`; for an authenticated user
 *   it persists `user_preferences.currency_code`. For a guest it is
 *   optional (validates and returns the currency, no server persistence).
 *   Unknown/inactive codes answer `422`.
 */
export async function getCurrencies(lang?: string): Promise<Currency[]> {
  const response = await apiFetch<ApiResponse<Currency[]>>(
    "/general/currencies",
    { lang, next: { revalidate: 300 } },
  );
  const list = Array.isArray(response.data) ? response.data : [];
  return list
    .filter((c) => c && c.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export async function selectCurrency(
  currencyCode: string,
  lang?: string,
): Promise<Currency> {
  const code = normalizeCurrencyCode(currencyCode);
  if (!code) {
    throw new Error("Invalid currency code.");
  }
  const response = await apiFetch<ApiResponse<Currency>>(
    "/general/currencies/select",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency_code: code }),
      lang,
    },
  );
  return response.data;
}

export const currencyService = {
  getCurrencies,
  selectCurrency,
};
