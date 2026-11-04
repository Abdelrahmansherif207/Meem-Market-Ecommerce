"use client";

import { useCallback } from "react";
import CatchProductCard from "@/features/home/redesign/CatchProductCard";
import { getFlashSaleProductsAction } from "../actions/flashSaleCurrencyActions";
import { useCurrencyRefetch } from "@/features/currencies";
import type { FlashSaleProduct } from "../types";

interface FlashSaleProductsIslandProps {
  slug: string;
  locale: string;
  initialProducts: FlashSaleProduct[];
  /** Currency code the server-rendered prices are in (catalog fallback). */
  initialCurrency?: string;
  /**
   * Real flash-sale end date (ISO) from the detail payload — enables the
   * live "Ends in" countdown pills on the cards.
   */
  flashEndAt?: string | null;
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
  flashEndAt = null,
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
            flashSaleActive: product.flash_sale_active ?? true,
            flashEndDate: flashEndAt,
            ratings: product.ratings,
            tags: product.tags,
          }}
          pricesLoading={isRefreshing}
        />
      ))}
    </div>
  );
}
