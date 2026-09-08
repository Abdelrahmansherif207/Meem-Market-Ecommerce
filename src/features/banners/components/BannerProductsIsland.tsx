"use client";

import { useCallback } from "react";
import PaginatedProductGrid from "@/components/ui/PaginatedProductGrid";
import { getBannerProductsAction } from "../actions/bannerCurrencyActions";
import { useCurrencyRefetch } from "@/features/currencies";
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

  return (
    <PaginatedProductGrid
      products={products}
      itemsPerPage={itemsPerPage}
      pricesLoading={isRefreshing}
    />
  );
}
