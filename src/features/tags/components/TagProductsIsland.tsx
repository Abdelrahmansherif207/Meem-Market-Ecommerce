"use client";

import { useCallback } from "react";
import CatchProductCard from "@/features/home/redesign/CatchProductCard";
import { getCategoryPageDataAction } from "@/features/categories/actions/categoryPageData";
import { useCurrencyRefetch } from "@/features/currencies";
import type { CategoryProduct } from "@/features/categories/types";

interface TagProductsIslandProps {
  slug: string;
  locale: string;
  initialProducts: CategoryProduct[];
  /** Currency code the server-rendered prices are in (catalog fallback). */
  initialCurrency?: string;
}

/**
 * Client island owning currency-driven refetches for the tag detail grid.
 * First paint shows server data as-is; refetches with the picker's code
 * as an explicit Server Action argument whenever it diverges.
 */
export function TagProductsIsland({
  slug,
  locale,
  initialProducts,
  initialCurrency,
}: TagProductsIslandProps) {
  const fetchAction = useCallback(
    (currency: string) =>
      getCategoryPageDataAction(slug, locale, undefined, "tag", currency).then(
        (data) => data.products,
      ),
    [slug, locale],
  );
  const { data: products, isRefreshing } = useCurrencyRefetch(
    fetchAction,
    initialProducts,
    initialCurrency,
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {products.map((product) => (
        <CatchProductCard
          key={product.id}
          item={{
            id: product.id,
            title: product.name,
            image: product.image?.thumbnail ?? "",
            price:
              product.price_after_flash_sale ??
              product.price_after_discount ??
              product.current_price,
            originalPrice: product.price,
            slug: product.slug,
            currency: product.currency,
            stockQuantity: product.quantity ?? 0,
            isInStock: product.in_stock ?? (product.quantity ?? 0) > 0,
            hasVariants: product.has_variants,
            inWishlist: product.in_wishlist,
            flashSaleActive: product.flash_sale_active ?? false,
            tags: product.tags,
          }}
          pricesLoading={isRefreshing}
        />
      ))}
    </div>
  );
}
