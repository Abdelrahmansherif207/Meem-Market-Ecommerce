"use server";

import {
  getCategoryPageData,
  getSearchPageData,
} from "../services/categoryProductsService";

/**
 * Category grid data in an explicit guest currency.
 *
 * The currency arrives as a plain argument from the calling client island
 * (the server stores nothing — no cookies, no globals) and is forwarded
 * as `X-Currency` via `apiFetch`. Currency-converted results bypass the
 * shared Data Cache (`cache: "no-store"` in the service).
 */
export async function getCategoryPageDataAction(
  slug: string,
  locale: string,
  searchParams: Record<string, string | string[] | undefined> | undefined,
  filterKey: "category" | "banner" | "promotion" | "tag" | undefined,
  currency: string | null | undefined,
) {
  return getCategoryPageData(
    slug,
    locale,
    searchParams,
    filterKey,
    currency ?? undefined,
  );
}

/**
 * Search-page products in an explicit guest currency (forwarded as
 * `X-Currency`). The server stores nothing — no cookies, no globals.
 * Failures throw so the island keeps its previously rendered prices.
 */
export async function getSearchPageDataAction(
  locale: string,
  searchParams: Record<string, string | string[] | undefined> | undefined,
  currency: string | null | undefined,
) {
  return getSearchPageData(locale, searchParams, currency ?? undefined);
}
