"use client";

import { useCallback } from "react";
import ProductCard from "@/components/ui/ProductCard";
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {products.map((product) => {
        const discountPercent =
          product.discount_active && product.current_price < product.price
            ? Math.round((1 - product.current_price / product.price) * 100)
            : 0;
        return (
          <ProductCard
            key={product.id}
            productId={product.id}
            image={product.image.thumbnail}
            title={product.name}
            price={product.current_price}
            originalPrice={product.price}
            currency={product.currency}
            discountPercent={discountPercent}
            slug={product.slug}
            hasVariants={product.has_variants}
            isInStock={product.in_stock ?? product.quantity > 0}
                inWishlist={product.in_wishlist}
                tags={product.tags}
                pricesLoading={isRefreshing}
              />
        );
      })}
    </div>
  );
}
