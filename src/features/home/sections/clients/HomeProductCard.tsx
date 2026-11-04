"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Plus, ShoppingBag, Star } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";

import { useCartActions } from "@/features/cart/hooks/useCartActions";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

import type { ProductItem } from "../../types";

interface HomeProductCardProps {
  item: ProductItem;
  /** CMS `badge_text` rendered as the small gold pill. */
  badgeText?: string;
  priority?: boolean;
  /** When true, price numbers render as skeleton bars (currency refetch). */
  pricesLoading?: boolean;
}

/**
 * Product card matched to the approved reference shot ("La Roche-Posay"
 * style): white rounded-xl card, square media on warm canvas, bare wishlist
 * heart at the top-right, bold rating "4.9 ★" with the floating bag-add
 * chip on its right, bold brand line, muted two-line product name,
 * struck-through original price, and the crimson price + "-50%" pill.
 *
 * Business behavior unchanged: useCartActions (guest/local + server cart),
 * WishlistButton (guest → auth modal), variants routed to the PDP,
 * canonical Price component. The API exposes ratings but no review counts,
 * so the "(329)" count of the mock is intentionally not rendered.
 */
export default function HomeProductCard({
  item,
  badgeText,
  priority,
  pricesLoading,
}: HomeProductCardProps) {
  const t = useTranslations("home");
  const { quantity, isPending, addItem, increment, decrement } =
    useCartActions(item.id);
  const [animating, setAnimating] = useState(false);

  const safePrice = item.price ?? 0;
  const safeOriginalPrice = item.originalPrice ?? 0;
  const inStock = item.isInStock ?? true;
  const discountPercent =
    safeOriginalPrice > safePrice && safeOriginalPrice > 0
      ? Math.round((1 - safePrice / safeOriginalPrice) * 100)
      : 0;

  const brandTag = item.tags?.[0];

  const handleAdd = useCallback(async () => {
    await addItem({
      quantity: 1,
      name: item.title,
      image: item.image,
      price: safePrice,
      current_price: safePrice,
      slug: item.slug ?? "",
      sku: item.sku ?? "",
      in_stock: inStock,
      stock_quantity: item.stockQuantity ?? 10,
    });
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
  }, [addItem, item.title, item.image, item.slug, item.sku, item.stockQuantity, safePrice, inStock]);

  const outOfStock = !inStock && quantity === 0;
  const selectVariants = !outOfStock && quantity === 0 && item.hasVariants;

  return (
    <article className="group/card flex h-full w-full flex-col overflow-hidden rounded-xl border border-(--home-stroke) bg-white shadow-[0_1px_4px_rgba(18,18,20,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_-8px_rgba(18,18,20,0.10)]">
      {/* ── Media ──────────────────────────────────────────────────── */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#faf9f7]">
        {item.image ? (
          <Link
            href={`/products/${item.slug}`}
            className="absolute inset-0 block h-full w-full"
            aria-label={item.title}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              className="object-cover object-center transition-transform duration-500 group-hover/card:scale-105"
            />
          </Link>
        ) : (
          <span
            className="absolute inset-0 flex items-center justify-center text-(--home-stroke)"
            aria-hidden
          >
            <ShoppingBag className="size-6 opacity-40" />
          </span>
        )}

        {/* Bare wishlist heart (top-right) — shared auth-aware component */}
        <WishlistButton
          productId={item.id}
          initialInWishlist={item.inWishlist}
          variant="icon"
          className="top-2 end-2 bg-transparent shadow-none backdrop-blur-none hover:bg-transparent"
        />
      </div>

      {/* ── Info ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        {/* Rating row + floating bag chip */}
        <div className="flex items-center justify-between gap-2">
          <RatingStar value={item.ratings} />
          {pricesLoading ? (
            <span
              className="inline-block h-9 w-9 animate-pulse rounded-lg bg-[#f2f0ec]"
              aria-hidden
            />
          ) : outOfStock ? (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f0ec] text-(--home-ink-muted)"
              aria-label={t("stockStates.out")}
            >
              <ShoppingBag className="size-4" aria-hidden />
            </span>
          ) : quantity > 0 ? (
            <div className="flex h-9 min-w-[76px] items-center justify-center rounded-lg border border-(--home-stroke) bg-white">
              <QuantityStepper
                value={quantity}
                onIncrement={increment}
                onDecrement={decrement}
                decrementAsRemove
                incrementDisabled={!inStock}
                disabled={isPending}
                variant="pill"
                size="sm"
              />
            </div>
          ) : selectVariants ? (
            <Link
              href={`/products/${item.slug}`}
              aria-label="Select options"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f0ec] text-(--home-ink) transition-colors hover:bg-[#e9e8e6]"
            >
              <span className="relative">
                <ShoppingBag className="size-4" aria-hidden />
                <Plus className="absolute -bottom-1.5 -end-1.5 size-2.5 stroke-[3]" aria-hidden />
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending}
              aria-label="Add to cart"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f0ec] text-(--home-ink) transition-all duration-200 hover:bg-[#e9e8e6]",
                animating && "scale-110",
                isPending && "cursor-not-allowed opacity-60",
              )}
            >
              <span className="relative">
                <ShoppingBag className="size-4" aria-hidden />
                <Plus className="absolute -bottom-1.5 -end-1.5 size-2.5 stroke-[3]" aria-hidden />
              </span>
            </button>
          )}
        </div>

        {/* Bold brand-style line (first real tag in the brand slot) */}
        {brandTag && (
          <Link
            href={`/tags/${brandTag.slug}`}
            className="mt-1.5 block max-w-full truncate text-[15px] font-bold leading-5 text-(--home-ink) hover:text-(--home-rose-deep)"
          >
            {brandTag.name}
          </Link>
        )}

        {/* Product name (muted, 2 lines) */}
        <Link href={`/products/${item.slug}`} className="mt-0.5 block">
          <h3
            className={cn(
              "line-clamp-2 text-[13px] leading-[18px] text-(--home-ink-muted) transition-colors group-hover/card:text-(--home-ink)",
              brandTag ? "" : "mt-1.5 text-[14px] font-semibold text-(--home-ink)",
            )}
          >
            {item.title}
          </h3>
        </Link>

        {/* CMS gold badge (authentic/exclusive-style tag) */}
        {badgeText && !discountPercent && (
          <span className="home-gold-glow mt-2 inline-flex w-fit items-center rounded-full bg-(--home-gold) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {badgeText}
          </span>
        )}

        {/* Original price (struck) */}
        {safeOriginalPrice > safePrice && !pricesLoading && (
          <div className="mt-2">
            <Price
              amount={safeOriginalPrice}
              currency={item.currency}
              decimals={2}
              className="text-[12px] font-medium leading-4 text-(--home-ink-muted) line-through"
            />
          </div>
        )}

        {/* Active price row: crimson + discount pill */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {pricesLoading ? (
            <span
              className="inline-block h-5 w-20 animate-pulse rounded bg-[#f2f0ec]"
              aria-hidden
            />
          ) : (
            <>
              <Price
                amount={safePrice}
                currency={item.currency}
                decimals={2}
                className="text-[17px] font-extrabold leading-6 text-(--home-vermilion)"
              />
              {discountPercent > 0 && (
                <span
                  className="rounded-full px-2 py-[2px] text-[11px] font-bold"
                  style={{
                    background: "rgba(201, 59, 43, 0.08)",
                    color: "#c93b2b",
                  }}
                >
                  -{discountPercent}%
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Rating: bold number + gold star (API exposes rating, not count) ─── */

function RatingStar({ value }: { value?: number }) {
  if (typeof value !== "number" || value <= 0) {
    // Keep the row height stable even without a rating.
    return <span className="h-6" aria-hidden />;
  }

  // List payloads rate 0–5; be defensive about percentage-like values.
  const normalized = value > 5 ? value / 20 : value;

  return (
    <span className="flex items-baseline gap-1 leading-6" dir="ltr">
      <span className="text-[15px] font-bold text-(--home-ink)">
        {normalized.toFixed(1)}
      </span>
      <Star
        className="size-[15px] shrink-0 translate-y-[1px] fill-[#c5a880] text-[#c5a880]"
        aria-hidden
      />
    </span>
  );
}
