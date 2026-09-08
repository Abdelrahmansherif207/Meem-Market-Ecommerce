"use client";

import { useCallback } from "react";
import { useCurrencyRefetch } from "@/features/currencies";
import { getCategoryPageDataAction } from "../actions/categoryPageData";
import ActiveFilterChips from "./ActiveFilterChips";
import CategoryProducts from "./CategoryProducts";
import type { CategoryProduct, CategoryProductsResponse } from "../types";

interface ProductsGridIslandProps {
  slug: string;
  locale: string;
  searchParams: Record<string, string | string[] | undefined>;
  filterKey?: "category" | "banner" | "promotion" | "tag";
  initialProducts: CategoryProduct[];
  initialLinks: CategoryProductsResponse["links"];
  /** Currency code the server-rendered prices are in (catalog fallback). */
  initialCurrency?: string;
}

/**
 * Client island owning currency-driven refetches for the category grid.
 *
 * First paint shows the server data as-is (catalog currency). Whenever the
 * picker's `selectedCode` differs — on mount with a stored preference, or
 * after a currency change — it calls the Server Action with the code as an
 * explicit argument, and the action attaches it as `X-Currency`. Prices show
 * a subtle refreshing treatment while the converted data loads.
 */
export default function ProductsGridIsland({
  slug,
  locale,
  searchParams,
  filterKey,
  initialProducts,
  initialLinks,
  initialCurrency,
}: ProductsGridIslandProps) {
  const paramsKey = JSON.stringify(searchParams);
  const fetchAction = useCallback(
    (currency: string) => {
      const params = JSON.parse(paramsKey) as Record<
        string,
        string | string[] | undefined
      >;
      return getCategoryPageDataAction(
        slug,
        locale,
        params,
        filterKey,
        currency,
      ).then((d) => ({ products: d.products, links: d.links }));
    },
    [slug, locale, filterKey, paramsKey],
  );
  const { data, isRefreshing } = useCurrencyRefetch(
    fetchAction,
    { products: initialProducts, links: initialLinks },
    initialCurrency,
  );

  return (
    <>
      <ActiveFilterChips />
      <CategoryProducts
        products={data.products}
        links={data.links}
        pricesLoading={isRefreshing}
      />
    </>
  );
}
