"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCartActions } from "@/features/cart/hooks/useCartActions";
import { useWishlistActions } from "@/features/wishlist/hooks/useWishlistActions";
import { NiceOneCountdown } from "@/features/products";
import FavouriteHeartIcon from "./FavouriteHeartIcon";
import AddToCartIcon from "./AddToCartIcon";
import type { ProductItem } from "../types";

interface CatchProductCardProps {
  item: ProductItem;
  /** Static CMS badge text (e.g. "NEW", "LOW STOCK"). */
  badgeText?: string;
  /** When true, price numbers render as skeleton bars while converted prices load. */
  pricesLoading?: boolean;
}

/** Low stock threshold for the automatic "Only X left" chip. */
const LOW_STOCK_THRESHOLD = 10;

/** Brand placeholder = first word of the title (backend has no brand field). */
function titleBrand(title: string): string {
  const first = title.trim().split(/\s+/)[0];
  return first ?? "";
}

/**
 * Exact Nice One product-card anatomy (from the real site DOM):
 * the whole card is a link (`min-w-[160px] max-w-[450px] rounded-[4px]
 * bg-white relative`, 10px padding), `h-[150px]` image with a fixed
 * `w-[130px]` product, badge pill (top-start) + bare heart (top-end) on
 * one row, floating `rounded-full` cart button anchored at the bottom of
 * a wrapper that includes the reserved `min-h-4` rating slot, brand line,
 * `min-h-10` two-line title, optional tag pills and a `min-h-11` price
 * block (12px was-price / 16px bold price / rounded full discount pill).
 * Interactive children (heart / add / stepper) suppress the link
 * navigation via preventDefault — matching the nested-controls behavior
 * of the real card. Rows auto-hide when the API lacks their data.
 * Cart/wishlist behavior comes from the existing hooks — logic untouched.
 */
export default function CatchProductCard({
  item,
  badgeText,
  pricesLoading = false,
}: CatchProductCardProps) {
  const t = useTranslations("catchHome");
  const tPdp = useTranslations("niceOnePdp");
  const { quantity, isPending, addItem, increment, decrement } = useCartActions(item.id);
  const { inWishlist, isPending: wishlistPending, toggle } = useWishlistActions(item.id, {
    initialInWishlist: item.inWishlist,
  });
  const [animating, setAnimating] = useState(false);

  const safePrice = item.price ?? 0;
  const safeOriginalPrice = item.originalPrice ?? 0;
  const discountPercent =
    safeOriginalPrice > safePrice && safeOriginalPrice > 0
      ? Math.round(((safeOriginalPrice - safePrice) / safeOriginalPrice) * 100)
      : 0;

  const rating = item.ratings ?? 0;
  const safeStock = item.stockQuantity ?? 0;
  const isLowStock = !badgeText && !item.flashSaleActive && safeStock > 0 && safeStock <= LOW_STOCK_THRESHOLD;
  const badge = badgeText ?? (isLowStock ? t("lowStock", { count: safeStock }) : null);

  /** Whole-card navigation target (fallback builds the PDP slug). */
  const productHref = `/products/${item.slug ?? `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${item.id}`}`;
  /** Overlay controls sit inside the card link — suppress its navigation. */
  const controlClick = (e: React.MouseEvent) => e.preventDefault();

  const handleAdd = useCallback(async () => {
    await addItem({
      quantity: 1,
      name: item.title,
      image: item.image,
      price: safePrice,
      current_price: safePrice,
      slug: item.slug ?? "",
      sku: item.sku ?? "",
      in_stock: item.isInStock ?? true,
      stock_quantity: item.stockQuantity ?? 10,
    });
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
  }, [addItem, item, safePrice]);

  /* Anchored at the bottom of the image+rating wrapper, like the real card. */
  const floatingButtonClass =
    "absolute bottom-0 end-0 z-10 flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-full bg-qty-surface text-neutral-800 transition-colors hover:bg-line";

  return (
    <Link
      href={productHref}
      aria-label={item.title}
      className="group relative block min-w-[160px] max-w-[450px] rounded-[4px] bg-white"
    >
      <article className="flex flex-col p-2.5">
        {/* Top region: badges, heart, image, rating slot */}
        <div className="relative">
          {/* Badge (start) + heart (end) */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between">
            <div className="min-w-0 overflow-hidden">
              {item.flashSaleActive ? (
                <span className="flex h-4 max-w-full items-center overflow-hidden rounded-full bg-discount px-2 text-[10px] text-white">
                  <span className="me-1 whitespace-nowrap">{tPdp("endsInLabel")}</span>
                  <NiceOneCountdown
                    endDate={item.flashEndDate ?? null}
                    alwaysShow
                    fallbackText={tPdp("flashDeal")}
                    className="h-4 gap-1 rounded-none bg-transparent px-0 py-0 text-[10px] font-semibold"
                  />
                </span>
              ) : badge ? (
                <span className="flex h-4 max-w-full items-center overflow-hidden rounded-full bg-primary px-2 text-[10px] text-white">
                  <span className="truncate">{badge}</span>
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggle();
              }}
              disabled={wishlistPending}
              aria-pressed={inWishlist}
              aria-label={inWishlist ? t("inWishlist") : t("addToWishlist")}
              className={cn(
                "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white transition-transform active:scale-90",
                wishlistPending && "cursor-not-allowed opacity-60",
              )}
            >
              <FavouriteHeartIcon filled={inWishlist} />
            </button>
          </div>

          {/* Floating cart button / stepper */}
          {!item.isInStock && quantity === 0 ? (
            <button
              type="button"
              disabled
              className={cn(floatingButtonClass, "cursor-not-allowed text-neutral-400")}
              aria-label={t("outOfStock")}
            >
              <AddToCartIcon className="h-6 w-6" />
            </button>
          ) : quantity === 0 && item.hasVariants ? (
            // Variant products: the whole-card link navigates to the PDP —
            // a nested anchor would be invalid, so this is visual only.
            <span className={floatingButtonClass} aria-hidden>
              <AddToCartIcon className="h-6 w-6" />
            </span>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleAdd();
              }}
              disabled={isPending}
              aria-label={t("addToCart")}
              className={cn(
                floatingButtonClass,
                animating && "scale-110",
                isPending && "cursor-not-allowed opacity-70",
              )}
            >
              <AddToCartIcon className="h-6 w-6" />
            </button>
          ) : (
            <div onClickCapture={controlClick} className="absolute bottom-0 end-0 z-10">
              <QuantityStepper
                value={quantity}
                onIncrement={increment}
                onDecrement={decrement}
                decrementAsRemove
                incrementDisabled={!item.isInStock}
                disabled={isPending}
                variant="pill"
                size="sm"
              />
            </div>
          )}

          {/* Image */}
          <span className="relative flex h-[150px] items-center justify-center">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.title}
                width={130}
                height={150}
                className="w-[130px] object-contain"
                sizes="130px"
              />
            ) : (
              <div className="h-[130px] w-[130px] rounded-lg bg-neutral-100" aria-hidden />
            )}
          </span>

          {/* Rating slot — reserved height keeps all cards aligned */}
          <div className="min-h-4">
            {rating > 0 && (
              <div className="flex items-center pb-1">
                <span className="flex h-4 items-center rounded-full bg-[#f5f5f5] px-1">
                  <span className="text-xs text-[#505050]">{rating}</span>
                  <Star className="ms-0.5 size-3 fill-[#f5c523] text-[#f5c523]" />
                </span>
                {item.reviewsCount != null && (
                  <span className="ms-1 text-[10px] text-[#cbcbcb]">({item.reviewsCount})</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Brand = title's first word (no brand field in the API) */}
        <div className="truncate text-xs font-bold text-[#757575]">
          {titleBrand(item.title)}
        </div>

        {/* Title — two lines reserved */}
        <div className="min-h-10">
          <h3 className="line-clamp-2 text-xs leading-5 text-neutral-700 transition-colors group-hover:text-primary">
            {item.title}
          </h3>
        </div>

        {/* Tag pills — hidden automatically when the product has none */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {item.tags.map((tag) => (
              <span
                key={tag.id}
                className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium leading-4 text-neutral-600"
              >
                <span className="text-primary">#</span> {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Prices — reserved block keeps rows aligned */}
        <div className="flex items-end min-h-11">
          <div>
            {pricesLoading ? (
              <div className="h-9 w-24 animate-pulse rounded bg-neutral-100" aria-hidden />
            ) : (
              <>
                {safeOriginalPrice > safePrice && (
                  <Price
                    amount={safeOriginalPrice}
                    currency={item.currency}
                    className="block text-xs font-medium text-[#b0b0b0] line-through"
                  />
                )}
                <div className="flex items-center gap-1">
                  <Price
                    amount={safePrice}
                    currency={item.currency}
                    className="text-base font-bold tracking-wide text-discount"
                  />
                  {discountPercent > 0 && (
                    <span className="flex h-4 items-center rounded-full bg-primary-tint px-1 text-xs text-discount" dir="ltr">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
