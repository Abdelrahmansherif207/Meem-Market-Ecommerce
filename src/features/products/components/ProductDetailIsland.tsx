"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import ProductSlider from "@/features/home/productSlider/ProductSlider";
import { getProductDetailAction } from "../actions/productCurrencyActions";
import { useCurrencyRefetch } from "@/features/currencies";
import { getDisplayPrice, getOriginalPrice } from "../utils";
import { ProductPageContent } from "./ProductPageContent";
import type { ProductDetail } from "../types";

interface ProductDetailIslandProps {
  slug: string;
  locale: string;
  initialProduct: ProductDetail;
}

/**
 * Client island owning currency-driven refetches for the product detail
 * page (main content + related slider both derive from the product).
 * First paint shows server data as-is; refetches with the picker's code
 * as an explicit Server Action argument whenever it diverges.
 */
export function ProductDetailIsland({
  slug,
  locale,
  initialProduct,
}: ProductDetailIslandProps) {
  const t = useTranslations("product");
  const fetchAction = useCallback(
    (currency: string) => getProductDetailAction(slug, locale, currency),
    [slug, locale],
  );
  const { data: product, isRefreshing } = useCurrencyRefetch(
    fetchAction,
    initialProduct,
    initialProduct.currency?.code,
  );

  const mappedRelated = product.related_products.map((rp) => ({
    id: rp.id,
    image: rp.image?.thumbnail || "",
    title: rp.name,
    price: getDisplayPrice(rp),
    originalPrice: getOriginalPrice(rp),
    slug: rp.slug ?? `${rp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${rp.id}`,
    inWishlist: rp.in_wishlist,
    tags: rp.tags,
    currency: rp.currency,
  }));

  return (
    <>
      <ProductPageContent product={product} pricesLoading={isRefreshing} />

      {mappedRelated.length > 0 && (
        <div className="mt-12">
          <ProductSlider
            title={t("relatedProducts")}
            items={mappedRelated}
            pricesLoading={isRefreshing}
          />
        </div>
      )}
    </>
  );
}
