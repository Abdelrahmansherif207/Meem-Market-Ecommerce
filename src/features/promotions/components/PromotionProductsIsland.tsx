"use client";

import { useCallback } from "react";
import CatchProductCard from "@/features/home/redesign/CatchProductCard";
import { getPromotionProductsAction } from "../actions/promotionCurrencyActions";
import { useCurrencyRefetch } from "@/features/currencies";
import type { PromotionProduct } from "../types";

interface PromotionProductsIslandProps {
  slug: string;
  locale: string;
  initialProducts: PromotionProduct[];
  /** Currency code the server-rendered prices are in (catalog fallback). */
  initialCurrency?: string;
}

/**
 * Client island owning currency-driven refetches for the promotion
 * detail grid. First paint shows server data as-is; refetches with the
 * picker's code as an explicit Server Action argument whenever it diverges.
 */
export function PromotionProductsIsland({
  slug,
  locale,
  initialProducts,
  initialCurrency,
}: PromotionProductsIslandProps) {
  const fetchAction = useCallback(
    (currency: string) => getPromotionProductsAction(slug, locale, currency),
    [slug, locale],
  );
  const { data: products, isRefreshing } = useCurrencyRefetch(
    fetchAction,
    initialProducts,
    initialCurrency,
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
      {products.map((product) => (
        <CatchProductCard
          key={product.id}
          item={{
            id: product.id,
            title: product.name,
            image: product.image?.thumbnail ?? "",
            price: product.current_price,
            originalPrice: product.price,
            slug: product.slug,
            currency: product.currency,
            stockQuantity: product.quantity ?? 0,
            isInStock: product.in_stock ?? (product.quantity ?? 0) > 0,
            hasVariants: product.has_variants,
            inWishlist: product.in_wishlist,
            flashSaleActive: product.discount_active ?? false,
            tags: product.tags,
          }}
          pricesLoading={isRefreshing}
        />
      ))}
    </div>
  );
}
