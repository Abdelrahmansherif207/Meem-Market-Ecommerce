"use client";

import { useLocale, useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useDisplayCurrency } from "@/features/currencies";
import { formatNumber } from "@/shared/utils/formatMoney";
import { NiceOneCountdown } from "./NiceOneCountdown";
import { NiceOneWishlistHeart } from "./NiceOneWishlistHeart";
import Skeleton from "@/components/ui/Skeleton";
import type { ProductDetail, ProductVariant } from "../../types";
import {
  getAverageRating,
  getDiscountPercent,
  getDisplayPrice,
  getOriginalPrice,
  getVariantPriceRange,
} from "../../utils";

interface NiceOneHeroInfoProps {
  product: ProductDetail;
  selectedVariant: ProductVariant | null;
  /** When true, price numbers render as skeleton bars (currency refetch). */
  pricesLoading?: boolean;
}

/**
 * Info panel header from the Stitch PDP screens: countdown pill + wishlist
 * heart row, product title, star rating, the big discounted price with
 * strikethrough original and `-%` pill, and the VAT note (static label —
 * the API carries no tax metadata).
 *
 * All pricing/currency logic is the same as the existing `ProductInfo`
 * component (same utils, same `useDisplayCurrency` resolution).
 */
export function NiceOneHeroInfo({ product, selectedVariant, pricesLoading = false }: NiceOneHeroInfoProps) {
  const t = useTranslations("product");
  const tPdp = useTranslations("niceOnePdp");
  const locale = useLocale();
  const { symbol: currencySymbol, decimalPlaces } = useDisplayCurrency(product.currency);
  const formatPrice = (v: number) => formatNumber(v, locale, decimalPlaces);

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
    <div className="space-y-3">
      {/* Flash-deal countdown (only when a real offer period exists) */}
      <NiceOneCountdown
        endDate={product.has_flash_sale || product.has_discount ? product.end_date : null}
      />

      {/* Title + wishlist heart on the same row (justify-between) */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="min-w-0 flex-1 text-xl font-bold leading-snug text-text-primary lg:text-2xl">
          {product.name}
        </h1>
        <div className="shrink-0">
          <NiceOneWishlistHeart product={product} selectedVariant={selectedVariant} />
        </div>
      </div>

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
                    : "fill-border text-border",
                )}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-text-primary">{avgRating}</span>
          <span className="text-2xs text-text-muted">({product.reviews.length})</span>
        </div>
      )}

      {/* Price block */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1" dir="ltr">
        {pricesLoading ? (
          <div aria-hidden>
            <Skeleton className="h-8 w-40" />
          </div>
        ) : selectedVariant || !hasVariants ? (
          <>
            <div className="text-2xl font-extrabold text-discount">
              {formatPrice(displayPrice)}
              <span className="ms-1 text-sm font-bold">{currencySymbol}</span>
            </div>
            {hasDiscount && (
              <>
                <span className="text-xs font-medium text-text-muted line-through">
                  {formatPrice(originalPrice)} {currencySymbol}
                </span>
                {discountPercent != null && (
                  <span className="rounded-full border border-discount/20 bg-primary-tint px-2 py-0.5 text-xs font-bold text-discount">
                    -{discountPercent}%
                  </span>
                )}
              </>
            )}
          </>
        ) : range!.min === range!.max ? (
          <div className="text-2xl font-extrabold text-discount">
            {formatPrice(range!.min)}
            <span className="ms-1 text-sm font-bold">{currencySymbol}</span>
          </div>
        ) : (
          <div
            className="text-2xl font-extrabold text-discount"
            aria-label={t("fromPrice", {
              min: `${formatPrice(range!.min)} ${currencySymbol}`,
              max: `${formatPrice(range!.max)} ${currencySymbol}`,
            })}
          >
            {formatPrice(range!.min)} – {formatPrice(range!.max)}
            <span className="ms-1 text-sm font-bold">{currencySymbol}</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-text-muted">{tPdp("vatIncluded")}</p>
    </div>
  );
}
