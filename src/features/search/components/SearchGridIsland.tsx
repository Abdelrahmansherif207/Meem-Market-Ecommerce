"use client";

import { useCallback } from "react";
import CategoryProducts from "@/features/categories/components/CategoryProducts";
import { getSearchPageDataAction } from "@/features/categories/actions/categoryPageData";
import { useCurrencyRefetch } from "@/features/currencies";
import { trackSearch, useOncePerKeyEffect } from "@/features/analytics";
import type { CategoryProduct } from "@/features/categories/types";
import SearchEmptyState from "./SearchEmptyState";

interface SearchGridIslandProps {
  locale: string;
  searchParams: Record<string, string | string[] | undefined>;
  initialProducts: CategoryProduct[];
  /** Currency code the server-rendered prices are in (catalog fallback). */
  initialCurrency?: string;
}

/** First `q` param value, trimmed (the storefront product search term). */
function readSearchTerm(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const q = searchParams.q;
  const raw = Array.isArray(q) ? q[0] : q;
  return raw?.trim() ?? "";
}

/**
 * Client island owning currency-driven refetches for the search grid.
 * First paint shows server data as-is; refetches with the picker's code
 * as an explicit Server Action argument whenever it diverges.
 */
export default function SearchGridIsland({
  locale,
  searchParams,
  initialProducts,
  initialCurrency,
}: SearchGridIslandProps) {
  const searchTerm = readSearchTerm(searchParams);

  // GA4 `search` — once per term per page view. Fires for the submitted
  // product query only (no filters, no personal data).
  useOncePerKeyEffect(searchTerm || null, () => trackSearch(searchTerm));

  const fetchAction = useCallback(
    (currency: string) =>
      getSearchPageDataAction(locale, searchParams, currency).then(
        (data) => data.products,
      ),
    [locale, searchParams],
  );
  const { data: products, isRefreshing } = useCurrencyRefetch(
    fetchAction,
    initialProducts,
    initialCurrency,
  );

  if (products.length === 0) {
    return <SearchEmptyState />;
  }

  return (
    <CategoryProducts
      products={products}
      pricesLoading={isRefreshing}
      itemListId="search_results"
      itemListName={searchTerm}
    />
  );
}
