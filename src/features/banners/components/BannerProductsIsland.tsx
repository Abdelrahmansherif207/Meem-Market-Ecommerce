"use client";

import { useCallback, useMemo } from "react";
import PaginatedProductGrid from "@/features/products/components/PaginatedProductGrid";
import { getBannerProductsAction } from "../actions/bannerCurrencyActions";
import { useCurrencyRefetch } from "@/features/currencies";
import { buildGA4Item, useListImpression } from "@/features/analytics";
import type { BannerProduct } from "../types";

interface BannerProductsIslandProps {
  slug: string;
  locale: string;
  initialProducts: BannerProduct[];
  itemsPerPage?: number;
  /** Currency code the server-rendered prices are in (catalog fallback). */
  initialCurrency?: string;
}

/**
 * Client island owning currency-driven refetches for the banner detail
 * grid. First paint shows server data as-is; refetches with the picker's
 * code as an explicit Server Action argument whenever it diverges.
 */
export function BannerProductsIsland({
  slug,
  locale,
  initialProducts,
  itemsPerPage = 12,
  initialCurrency,
}: BannerProductsIslandProps) {
  const fetchAction = useCallback(
    (currency: string) => getBannerProductsAction(slug, locale, currency),
    [slug, locale],
  );
  const { data: products, isRefreshing } = useCurrencyRefetch(
    fetchAction,
    initialProducts,
    initialCurrency,
  );

  const ga4Items = useMemo(
    () =>
      products.map((product, index) =>
        buildGA4Item({
          id: product.id,
          name: product.name,
          price: product.current_price,
          originalPrice: product.price,
          index,
        }),
      ),
    [products],
  );
  useListImpression(ga4Items, `banner_${slug}`);

  return (
    <PaginatedProductGrid
      products={products}
      itemsPerPage={itemsPerPage}
      pricesLoading={isRefreshing}
      itemListId={`banner_${slug}`}
    />
  );
}
