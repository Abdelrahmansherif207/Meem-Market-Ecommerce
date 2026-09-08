"use client";

import { useCallback } from "react";
import ProductCard from "@/components/ui/ProductCard";
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {products.map((product) => {
        const discountPercent =
          product.price_after_discount > 0 && product.price_after_discount < product.price
            ? Math.round((1 - product.price_after_discount / product.price) * 100)
            : 0;
        return (
          <ProductCard
            key={product.id}
            productId={product.id}
            image={product.image.thumbnail}
            title={product.name}
            price={product.price_after_discount > 0 ? product.price_after_discount : product.price}
            originalPrice={product.price}
            currency={product.currency}
            discountPercent={discountPercent}
            slug={product.slug}
            isInStock
                inWishlist={product.in_wishlist}
                tags={product.tags}
                pricesLoading={isRefreshing}
              />
        );
      })}
    </div>
  );
}
