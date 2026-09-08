"use client";

import { useCallback } from "react";
import ProductCard from "@/components/ui/ProductCard";
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {products.map((product) => {
        const discountPercent =
          product.has_discount && product.discount_valid
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
