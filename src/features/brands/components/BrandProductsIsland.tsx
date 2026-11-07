"use client";

import { useCallback } from "react";
import ProductCard from "@/features/products/components/ProductCard";
import { getBrandProductsAction } from "../actions/brandCurrencyActions";
import { useCurrencyRefetch } from "@/features/currencies";
import type { BrandProduct } from "../types";

interface BrandProductsIslandProps {
  slug: string;
  locale: string;
  initialProducts: BrandProduct[];
  /** Currency code the server-rendered prices are in (catalog fallback). */
  initialCurrency?: string;
}

/**
 * Client island owning currency-driven refetches for the brand detail
 * grid. First paint shows server data as-is; refetches with the picker's
 * code as an explicit Server Action argument whenever it diverges.
 */
export function BrandProductsIsland({
  slug,
  locale,
  initialProducts,
  initialCurrency,
}: BrandProductsIslandProps) {
  const fetchAction = useCallback(
    (currency: string) => getBrandProductsAction(slug, locale, currency),
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
        <ProductCard
          key={product.id}
          item={{
            id: product.id,
            title: product.name,
            image: product.image?.thumbnail ?? "",
            price: product.price_after_discount > 0 ? product.price_after_discount : product.price,
            originalPrice: product.price,
            slug: product.slug,
            currency: product.currency,
            isInStock: true,
            inWishlist: product.in_wishlist,
            tags: product.tags,
            ratings: product.rating,
            reviewsCount: product.ratings_count,
            brands: product.brands,
          }}
          pricesLoading={isRefreshing}
        />
      ))}
    </div>
  );
}
