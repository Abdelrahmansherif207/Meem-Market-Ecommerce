"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import {
  AddToCartIcon,
  FavouriteHeartIcon,
} from "@/components/ui/icons";
import { useCartActions } from "@/features/cart/hooks/useCartActions";
import { useWishlistActions } from "@/features/wishlist/hooks/useWishlistActions";
import { NiceOneCountdown } from "./niceone/NiceOneCountdown";
import type { ProductCardItem } from "../types";

interface ProductCardProps {
  item: ProductCardItem;
  /** Static CMS badge text (e.g. "NEW", "FLASH SALE"). */
  badgeText?: string;
  /** When true, price numbers render as skeleton bars while converted prices load. */
  pricesLoading?: boolean;
  className?: string;
  /**
   * `grid` (default) is the portrait card used by shelves and listings.
   * `list` keeps the same behavior but lays the media beside the details for
   * CMS sections that request a list layout.
   */
  variant?: "grid" | "list";
}

/** Low stock threshold for the automatic "Only X left" chip. */
const LOW_STOCK_THRESHOLD = 10;

/** Brand placeholder = first word of the title when the API has no brand. */
function titleBrand(title: string): string {
  const first = title.trim().split(/\s+/)[0];
  return first ?? "";
}

/**
 * Canonical Rawd Al-Aseel product card.
 *
 * One card for every listing surface. The whole card navigates through an
 * overlay link; interactive controls are siblings above it, so there are no
 * nested anchors or buttons. Cart/wishlist/currency behavior is delegated to
 * the existing hooks and `Price`, exactly like the previous homepage card.
 */
export default function ProductCard({
  item,
  badgeText,
  pricesLoading = false,
  className,
  variant = "grid",
}: ProductCardProps) {
  const isList = variant === "list";
  const t = useTranslations("catchHome");
  const tPdp = useTranslations("niceOnePdp");
  const { quantity, isPending, addItem, increment, decrement } =
    useCartActions(item.id);
  const {
    inWishlist,
    isPending: wishlistPending,
    toggle,
  } = useWishlistActions(item.id, {
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
  const safeStock = item.stockQuantity ?? item.inStock ?? 0;
  const explicitBadge = badgeText?.trim() || null;
  const isLowStock =
    !explicitBadge &&
    !item.flashSaleActive &&
    safeStock > 0 &&
    safeStock <= LOW_STOCK_THRESHOLD;
  const badge =
    explicitBadge ?? (isLowStock ? t("lowStock", { count: safeStock }) : null);
  const brandName = item.brands?.[0]?.name?.trim() || titleBrand(item.title);

  /** Whole-card navigation target (fallback builds the PDP slug). */
  const productHref = `/products/${
    item.slug ??
    `${item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${item.id}`
  }`;

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

  const floatingButtonClass =
    "flex h-9 min-w-9 items-center justify-center rounded-full transition-all";

  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-catch-border-soft bg-white transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-elev-2",
        isList
          ? "grid grid-cols-[6.5rem_minmax(0,1fr)] sm:grid-cols-[8rem_minmax(0,1fr)]"
          : "flex flex-col",
        className,
      )}
    >
      {/* Whole-card link sits above the content; controls are siblings above it. */}
      <Link
        href={productHref}
        aria-label={item.title}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      />

      <div
        className={cn(
          "flex items-start justify-between gap-2",
          isList ? "col-start-2 row-start-1 p-3 pb-0" : "p-3 pb-0",
        )}
      >
        <div className="min-w-0 overflow-hidden pt-0.5">
          {!explicitBadge && item.flashSaleActive ? (
            <span className="inline-flex h-5 max-w-full min-w-0 items-center overflow-hidden rounded-full bg-primary px-2 text-[10px] leading-none text-white">
              <NiceOneCountdown
                endDate={item.flashEndDate ?? null}
                alwaysShow
                fallbackText={tPdp("flashDeal")}
                prefix={tPdp("endsInLabel")}
                className="h-5 gap-1 whitespace-nowrap rounded-none bg-transparent px-0 py-0 text-[9px] font-semibold leading-none sm:text-[10px]"
              />
            </span>
          ) : badge ? (
            <span
              title={badge}
              className={cn(
                "inline-flex h-5 max-w-full items-center overflow-hidden rounded-full bg-primary font-semibold leading-none text-white",
                isLowStock
                  ? "px-1.5 text-[9px] sm:px-2 sm:text-[10px]"
                  : "px-2 text-[10px]",
              )}
            >
              <span className="truncate">{badge}</span>
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={wishlistPending}
          aria-pressed={inWishlist}
          aria-label={inWishlist ? t("inWishlist") : t("addToWishlist")}
          className={cn(
            "relative z-20 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-catch-border-soft bg-white text-catch-charcoal shadow-sm transition-all hover:border-catch-rose hover:text-primary active:scale-90",
            wishlistPending && "cursor-not-allowed opacity-60",
          )}
        >
          <FavouriteHeartIcon filled={inWishlist} className="h-4 w-4" />
        </button>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-catch-blush",
          isList
            ? "col-start-1 row-span-2 row-start-1 m-2 me-0 self-center"
            : "mx-3 mt-2",
        )}
      >
        <div className="relative aspect-square w-full">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="absolute inset-3 rounded-lg bg-catch-surface"
              aria-hidden
            />
          )}
        </div>

        <div className="absolute bottom-2 end-2 z-20">
          {item.isInStock === false && quantity === 0 ? (
            <button
              type="button"
              disabled
              className={cn(
                floatingButtonClass,
                "cursor-not-allowed border border-catch-border bg-white/90 text-catch-muted-soft",
              )}
              aria-label={t("outOfStock")}
            >
              <AddToCartIcon className="h-5 w-5" />
            </button>
          ) : quantity === 0 && item.hasVariants ? (
            // Variant products: the overlay link navigates to the PDP.
            <span
              className={cn(
                floatingButtonClass,
                "pointer-events-none bg-primary text-white shadow-md",
              )}
              aria-hidden
            >
              <AddToCartIcon className="h-5 w-5" />
            </span>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending}
              aria-label={t("addToCart")}
              className={cn(
                floatingButtonClass,
                "cursor-pointer bg-primary text-white shadow-md hover:bg-primary-active",
                animating && "scale-110",
                isPending && "cursor-not-allowed opacity-70",
              )}
            >
              <AddToCartIcon className="h-5 w-5" />
            </button>
          ) : (
            <QuantityStepper
              value={quantity}
              onIncrement={increment}
              onDecrement={decrement}
              decrementAsRemove
              incrementDisabled={item.isInStock === false}
              disabled={isPending}
              variant="pill"
              size="sm"
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-1.5 p-3 pt-2.5",
          isList && "col-start-2 row-start-2 pt-1",
        )}
      >
        <div className="flex min-h-4 items-center justify-between gap-2">
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-catch-muted">
            {brandName}
          </span>
          {rating > 0 ? (
            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-catch-surface px-1.5 py-0.5 text-[10px] font-semibold text-catch-charcoal">
              {rating}
              <Star className="size-2.5 fill-catch-rose text-catch-rose" />
              {item.reviewsCount != null && item.reviewsCount > 0 ? (
                <span className="text-catch-muted">({item.reviewsCount})</span>
              ) : null}
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 min-h-9 text-xs font-medium leading-[1.45] text-catch-charcoal transition-colors group-hover:text-primary">
          {item.title}
        </h3>

        {item.tags && item.tags.length > 0 ? (
          <div className="flex items-center gap-1 overflow-hidden">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="shrink-0 whitespace-nowrap rounded-full bg-catch-surface px-1.5 py-0.5 text-[9px] font-medium leading-4 text-catch-muted"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          {pricesLoading ? (
            <div
              className="h-8 w-20 animate-pulse rounded-lg bg-catch-surface"
              aria-hidden
            />
          ) : (
            <div className="min-w-0">
              {safeOriginalPrice > safePrice ? (
                <Price
                  amount={safeOriginalPrice}
                  currency={item.currency}
                  className="block text-[10px] font-medium text-catch-muted-soft line-through"
                />
              ) : null}
              <div className="flex items-center gap-1.5">
                <Price
                  amount={safePrice}
                  currency={item.currency}
                  className="text-sm font-bold tracking-wide text-primary sm:text-base"
                />
                {discountPercent > 0 ? (
                  <span
                    className="flex h-4 items-center rounded-full bg-catch-blush px-1.5 text-[10px] font-semibold text-primary"
                    dir="ltr"
                  >
                    -{discountPercent}%
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
