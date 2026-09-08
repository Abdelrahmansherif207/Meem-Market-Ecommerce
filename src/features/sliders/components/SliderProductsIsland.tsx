"use client";

import { useCallback } from "react";
import PaginatedProductGrid from "@/components/ui/PaginatedProductGrid";
import { getSliderProductsAction } from "../actions/sliderCurrencyActions";
import { useCurrencyRefetch } from "@/features/currencies";
import type { SliderProduct } from "../types";

interface SliderProductsIslandProps {
  slug: string;
  locale: string;
  initialProducts: SliderProduct[];
  itemsPerPage?: number;
  /** Currency code the server-rendered prices are in (catalog fallback). */
  initialCurrency?: string;
}

/**
 * Client island owning currency-driven refetches for the slider detail
 * grid. First paint shows server data as-is; refetches with the picker's
 * code as an explicit Server Action argument whenever it diverges.
 */
export function SliderProductsIsland({
  slug,
  locale,
  initialProducts,
  itemsPerPage = 12,
  initialCurrency,
}: SliderProductsIslandProps) {
  const fetchAction = useCallback(
    (currency: string) => getSliderProductsAction(slug, locale, currency),
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
