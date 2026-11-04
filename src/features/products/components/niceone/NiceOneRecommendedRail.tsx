"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCartActions } from "@/features/cart/hooks/useCartActions";
import { useDisplayCurrency } from "@/features/currencies";
import { formatNumber } from "@/shared/utils/formatMoney";
import Skeleton from "@/components/ui/Skeleton";
import type { RelatedProduct } from "../../types";
import { getDiscountPercent, getDisplayPrice, getOriginalPrice } from "../../utils";

interface NiceOneRecommendedRailProps {
  items: RelatedProduct[];
  pricesLoading?: boolean;
  /** Optional "See more" target (e.g. the product's main category page). */
  seeMoreHref?: string | null;
}

/**
 * "Recommended Products" rail from the Stitch PDP screens: white bordered
 * cards (image, rating, two-line title, discounted price, quick-add) in a
 * horizontal scroller on mobile and a 7-up grid on desktop.
 *
 * Data source = the product's `related_products` (same items the previous
 * ProductSlider received), with the same cart + wishlist hooks per card.
 * "Ends in" timers can't be shown per card because `RelatedProduct` has no
 * offer dates — active flash items get a small honest "Flash deal" badge.
 */
export function NiceOneRecommendedRail({ items, pricesLoading = false, seeMoreHref }: NiceOneRecommendedRailProps) {
  const t = useTranslations("niceOnePdp");

  if (items.length === 0) return null;

  return (
    <section className="mt-10" data-purpose="recommended-carousel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-text-primary sm:text-lg">{t("recommendedProducts")}</h2>
        {seeMoreHref && (
          <Link
            href={seeMoreHref}
            className="text-xs font-medium text-text-secondary underline-offset-2 hover:text-text-primary hover:underline lg:hidden"
          >
            {t("seeMore")}
          </Link>
        )}
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0">
        {items.map((item) => (
          <NiceOneRecommendedCard key={item.id} item={item} pricesLoading={pricesLoading} />
        ))}
      </div>
    </section>
  );
}

function NiceOneRecommendedCard({
  item,
  pricesLoading,
}: {
  item: RelatedProduct;
  pricesLoading: boolean;
}) {
  const tProduct = useTranslations("product");
  const tPdp = useTranslations("niceOnePdp");
  const locale = useLocale();
  const { code: currencyCode, decimalPlaces } = useDisplayCurrency(item.currency);
  const formatPrice = (v: number) => formatNumber(v, locale, decimalPlaces);

  const displayPrice = getDisplayPrice(item);
  const originalPrice = getOriginalPrice(item);
  const discountPercent = getDiscountPercent(item);
  const inStock = item.quantity > 0;

  const { quantity: cartQuantity, isPending, addItem, increment, decrement } = useCartActions(item.id);

  async function handleAdd() {
    await addItem({
      quantity: 1,
      product_variant_id: null,
      name: item.name,
      image: item.image?.thumbnail ?? "",
      price: displayPrice,
      current_price: displayPrice,
      slug: item.slug ?? "",
      sku: "",
      in_stock: inStock,
      stock_quantity: item.quantity,
    });
  }

  const href = item.slug
    ? `/products/${item.slug}`
    : `/products/${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${item.id}`;

  return (
    <article
      className={cn(
        "group relative flex w-full shrink-0 flex-col justify-between rounded-lg border border-line bg-white p-3 transition hover:shadow-elev-2",
        "w-36 lg:w-auto",
      )}
    >
      {item.has_flash_sale && (
        <span className="absolute start-2 top-2 z-10 rounded bg-discount px-1.5 py-0.5 text-[9px] font-bold text-white">
          {tPdp("flashDeal")}
        </span>
      )}

      <WishlistButton
        productId={item.id}
        initialInWishlist={item.in_wishlist}
        variant="icon"
      />

      <Link href={href} className="block">
        <span className="mb-2 flex h-28 items-center justify-center overflow-hidden rounded-lg bg-page-gray p-2">
          {item.image?.thumbnail ? (
            <Image
              src={item.image.thumbnail}
              alt={item.name}
              width={144}
              height={144}
              sizes="144px"
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          ) : null}
        </span>

        {item.ratings > 0 && (
          <span className="flex items-center gap-1 text-[10px]">
            <span className="font-bold text-amber-500">{item.ratings}</span>
            <Star className="size-2.5 fill-yellow-400 text-yellow-400" aria-hidden />
          </span>
        )}
        <span className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-tight text-text-primary">
          {item.name}
        </span>
      </Link>

      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="min-w-0" dir="ltr">
          {pricesLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <>
              {originalPrice > displayPrice && (
                <span className="block text-[10px] leading-none text-text-muted line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span className="flex flex-wrap items-center gap-1">
                <span className="text-xs font-bold text-discount">
                  {formatPrice(displayPrice)} <span className="text-[9px]">{currencyCode}</span>
                </span>
                {discountPercent != null && (
                  <span className="rounded bg-primary-tint px-1 text-[10px] font-bold text-discount">
                    -{discountPercent}%
                  </span>
                )}
              </span>
            </>
          )}
        </span>

        {cartQuantity > 0 ? (
          <QuantityStepper
            value={cartQuantity}
            onIncrement={() => increment()}
            onDecrement={() => decrement()}
            decrementAsRemove
            disabled={isPending || !inStock}
            size="sm"
            variant="pill"
            incrementLabel={tProduct("increaseQuantity")}
            decrementLabel={tProduct("decreaseQuantity")}
            removeLabel={tProduct("removeItem")}
          />
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inStock || isPending}
            aria-label={tPdp("addToBag")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-text-secondary transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="size-3" />
          </button>
        )}
      </div>
    </article>
  );
}
