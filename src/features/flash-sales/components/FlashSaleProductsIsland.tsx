"use client";

import { useCallback } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { getFlashSaleProductsAction } from "../actions/flashSaleCurrencyActions";
import { useCurrencyRefetch } from "@/features/currencies";
import type { FlashSaleProduct } from "../types";

interface FlashSaleProductsIslandProps {
  slug: string;
  locale: string;
  initialProducts: FlashSaleProduct[];
  /** Currency code the server-rendered prices are in (catalog fallback). */
  initialCurrency?: string;
}

/**
 * Client island owning currency-driven refetches for the flash-sale
 * detail grid. First paint shows server data as-is; refetches with the
 * picker's code as an explicit Server Action argument whenever it diverges.
 */
export function FlashSaleProductsIsland({
  slug,
  locale,
  initialProducts,
  initialCurrency,
}: FlashSaleProductsIslandProps) {
  const fetchAction = useCallback(
    (currency: string) => getFlashSaleProductsAction(slug, locale, currency),
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
          product.flash_sale_active && product.current_price < product.price
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
            flashSaleActive={product.flash_sale_active}
                inWishlist={product.in_wishlist}
                tags={product.tags}
                pricesLoading={isRefreshing}
              />
        );
      })}
    </div>
  );
}
