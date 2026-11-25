"use client";

import { useCallback, useMemo } from "react";
import ProductCard from "@/features/products/components/ProductCard";
import { getHoverImage } from "@/features/products/utils";
import { getBrandProductsAction } from "../actions/brandCurrencyActions";
import { useCurrencyRefetch } from "@/features/currencies";
import { buildGA4Item, useListImpression } from "@/features/analytics";
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

  const ga4Items = useMemo(
    () =>
      products.map((product, index) =>
        buildGA4Item({
          id: product.id,
          name: product.name,
          price:
            product.price_after_discount > 0
              ? product.price_after_discount
              : product.price,
          originalPrice: product.price,
          index,
        }),
      ),
    [products],
  );
  useListImpression(ga4Items, `brand_${slug}`);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          item={{
            id: product.id,
            title: product.name,
            image: product.image?.thumbnail ?? "",
            hoverImage: getHoverImage(
              product.image,
              product.image?.thumbnail ?? "",
            ),
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
          itemListId={`brand_${slug}`}
          pricesLoading={isRefreshing}
        />
      ))}
    </div>
  );
}
