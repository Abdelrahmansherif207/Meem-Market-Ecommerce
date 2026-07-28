"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { ProductDetail, ProductVariant } from "../types";
import {
  getDisplayPrice,
  getOriginalPrice,
  getDiscountPercent,
  getAverageRating,
  getVariantPriceRange,
} from "../utils";

interface ProductInfoProps {
  product: ProductDetail;
  selectedVariant?: ProductVariant | null;
}

export function ProductInfo({ product, selectedVariant }: ProductInfoProps) {
  const t = useTranslations("product");
  const avgRating = getAverageRating(product.reviews);
  const hasVariants = product.variants.length > 0;
  const range = hasVariants ? getVariantPriceRange(product.variants) : null;

  let displayPrice: number;
  let originalPrice: number;
  let discountPercent: number | null;

  if (selectedVariant) {
    displayPrice = selectedVariant.current_price;
    originalPrice = selectedVariant.price;
    discountPercent =
      originalPrice > displayPrice
        ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
        : null;
  } else if (hasVariants && range) {
    displayPrice = range.min;
    originalPrice = displayPrice;
    discountPercent = null;
  } else {
    displayPrice = getDisplayPrice(product);
    originalPrice = getOriginalPrice(product);
    discountPercent = getDiscountPercent(product);
  }

  const hasDiscount = displayPrice < originalPrice;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
        {product.name}
      </h1>

      {product.reviews.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "size-4",
                  star <= avgRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200",
                )}
              />
            ))}
          </div>
          <span className="text-sm text-text-secondary">
              {avgRating} ({product.reviews.length} {t("reviews")})
            </span>
        </div>
      )}

      <div className="flex items-baseline gap-3">
        {selectedVariant || !hasVariants ? (
          <>
            <span className="text-3xl font-bold text-text-primary">
              {displayPrice.toFixed(2)} {t("currency")}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-text-secondary line-through">
                  {originalPrice.toFixed(2)} {t("currency")}
                </span>
                {discountPercent && (
                  <span className="rounded-md bg-discount px-2 py-0.5 text-xs font-bold text-white">
                    -{discountPercent}%
                  </span>
                )}
              </>
            )}
          </>
        ) : range!.min === range!.max ? (
          <span className="text-3xl font-bold text-text-primary">
            {range!.min.toFixed(2)} {t("currency")}
          </span>
        ) : (
          <span className="text-3xl font-bold text-text-primary">
            {t("fromPrice", {
              min: `${range!.min.toFixed(2)} ${t("currency")}`,
              max: `${range!.max.toFixed(2)} ${t("currency")}`,
            })}
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-text-secondary line-clamp-3">
        {product.description}
      </p>
    </div>
  );
}
