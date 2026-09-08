"use server";

import { apiFetch } from "@/shared/lib/api";
import { normalizeCurrencyCode } from "@/shared/lib/currency";

/**
 * Generic catalog read in an explicit guest currency.
 *
 * The currency crosses the client→server boundary as a plain argument —
 * the server stores nothing (no cookies, no globals). `apiFetch` attaches
 * it centrally as `X-Currency`. Missing/invalid values omit the header so
 * the Backend falls back to the catalog currency.
 *
 * GET reads only. Mutations stay on client-side `apiFetch` (the browser
 * resolves the stored preference itself, no action needed).
 */
export async function fetchCatalogInCurrency(
  endpoint: string,
  currency: string | null | undefined,
  lang?: string,
): Promise<unknown> {
  const code = normalizeCurrencyCode(currency);
  return apiFetch<unknown>(endpoint, {
    ...(lang ? { lang } : {}),
    ...(code ? { currency: code, cache: "no-store" as RequestCache } : {}),
  });
}
