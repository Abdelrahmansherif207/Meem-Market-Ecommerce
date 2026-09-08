"use client";

import { useCallback } from "react";
import CategoryProducts from "@/features/categories/components/CategoryProducts";
import { getSearchPageDataAction } from "@/features/categories/actions/categoryPageData";
import { useCurrencyRefetch } from "@/features/currencies";
import type { CategoryProduct } from "@/features/categories/types";
import SearchEmptyState from "./SearchEmptyState";

interface SearchGridIslandProps {
  locale: string;
  searchParams: Record<string, string | string[] | undefined>;
  initialProducts: CategoryProduct[];
  /** Currency code the server-rendered prices are in (catalog fallback). */
  initialCurrency?: string;
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
    <CategoryProducts products={products} pricesLoading={isRefreshing} />
  );
}
