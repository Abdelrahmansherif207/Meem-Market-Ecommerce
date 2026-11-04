"use client";

import { useCallback } from "react";
import { getProductDetailAction } from "../actions/productCurrencyActions";
import { useCurrencyRefetch } from "@/features/currencies";
import { NiceOneProductPageContent } from "./niceone/NiceOneProductPageContent";
import type { ProductDetail } from "../types";

interface ProductDetailIslandProps {
  slug: string;
  locale: string;
  initialProduct: ProductDetail;
}

/**
 * Client island owning currency-driven refetches for the product detail
 * page (main content + related sections both derive from the product).
 * First paint shows server data as-is; refetches with the picker's code
 * as an explicit Server Action argument whenever it diverges.
 */
export function ProductDetailIsland({
  slug,
  locale,
  initialProduct,
}: ProductDetailIslandProps) {
  const fetchAction = useCallback(
    (currency: string) => getProductDetailAction(slug, locale, currency),
    [slug, locale],
  );
  const { data: product, isRefreshing } = useCurrencyRefetch(
    fetchAction,
    initialProduct,
    initialProduct.currency?.code,
  );

  return (
    <NiceOneProductPageContent product={product} pricesLoading={isRefreshing} />
  );
}
