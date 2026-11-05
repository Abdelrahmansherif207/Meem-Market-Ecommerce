"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCartActions } from "@/features/cart/hooks/useCartActions";
import { useDisplayCurrency } from "@/features/currencies";
import { formatNumber } from "@/shared/utils/formatMoney";
import Skeleton from "@/components/ui/Skeleton";
import type { RelatedProduct } from "../../types";
import { getDiscountPercent, getDisplayPrice, getOriginalPrice } from "../../utils";

/** Slide width as a fraction of the viewport (leaves a peek of the next card). */
const SLIDE_VIEWPORT_FRACTION = 0.85;
/** Horizontal gap between slides (px) — keep in sync with track gap-4. */
const SLIDE_GAP = 16;

interface NiceOneBundleSectionProps {
  items: RelatedProduct[];
  pricesLoading?: boolean;
}

/**
 * "Usually bought together" band — the cross-sell carousel from the Stitch
 * screens: blue-tinted band with a row of bundle cards (main card fills the
 * band with the next card cut at the edge, exactly like the real site).
 *
 * Swapping works by dragging/swiping the cards right or left (pointer-based
 * translate track — transform math, no carousel library so it cannot fail to
 * init), plus the slim edge chevrons and the dots centered below the card
 * row. RTL mirrors everything (drag direction flips, chevrons/peek on the
 * other side). Hidden when there are no related items.
 */
export function NiceOneBundleSection({ items, pricesLoading = false }: NiceOneBundleSectionProps) {
  const t = useTranslations("niceOnePdp");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportW, setViewportW] = useState(0);

  const [index, setIndex] = useState(0);
  /** Live pixel offset while dragging; null = not dragging. */
  const [dragDx, setDragDx] = useState<number | null>(null);
  const dragStateRef = useRef<{ startX: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  // Keep the slide step in sync with responsive viewport width.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setViewportW(el.clientWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const clamp = useCallback((v: number) => Math.max(0, Math.min(items.length - 1, v)), [items.length]);
  const stepPx = viewportW * SLIDE_VIEWPORT_FRACTION + SLIDE_GAP;

  // ── Drag / swipe (pointer events; works for mouse + pen; touch is native) ──
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (items.length < 2) return;
    if (!e.isPrimary) return;
    dragStateRef.current = { startX: e.clientX, moved: false };
    // NOTE: pointer capture is set lazily in `onPointerMove` (after the drag
    // threshold) — capturing on plain down would retarget the resulting
    // click away from the quick-add buttons/links inside the cards.
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) > 8) {
      drag.moved = true;
      suppressClickRef.current = true;
      viewportRef.current?.setPointerCapture?.(e.pointerId);
    }
    if (drag.moved) {
      setDragDx(dx);
      e.preventDefault();
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    if (drag.moved) {
      // Direction-aware: drag left → next in LTR, drag right → next in RTL.
      const candidate = Math.round(-dx / stepPx) * (isRtl ? -1 : 1);
      setIndex((i) => clamp(i + candidate));
      // Reset pointer state on the next frame so the transform transitions back.
      requestAnimationFrame(() => setDragDx(null));
    } else {
      setDragDx(null);
    }
    dragStateRef.current = null;
    // Let a fresh click through on the following pointer sequence.
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 50);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (items.length === 0) return null;

  const single = items.length < 2;
  const PrevChevron = isRtl ? ChevronRight : ChevronLeft;
  const NextChevron = isRtl ? ChevronLeft : ChevronRight;
  const trackOffsetBase = (isRtl ? 1 : -1) * index * stepPx;
  const translate = `translateX(${(dragDx ?? 0) + trackOffsetBase}px)`;

  return (
    <section
      className="mt-4 overflow-hidden rounded-xl border border-(--pdp-band-border) bg-(--pdp-band) p-4 lg:p-5"
      data-purpose="bundle-cross-sell"
    >
      {/* Header (Stitch: blue wand icon + title + subtitle) */}
      <div className="flex items-center gap-2">
        <Sparkles aria-hidden className="size-4 shrink-0 text-blue-500" />
        <div>
          <h3 className="text-sm font-bold leading-none text-text-primary">
            {t("usuallyBoughtTogether")}
          </h3>
          <span className="mt-0.5 block text-[11px] text-text-muted">
            {t("recommendedProducts")}
          </span>
        </div>
      </div>

      <div className="relative mt-4">
        {/* Card track — main card + peeking next card, dragged/swiped */}
        <div
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={onClickCapture}
          className={cn(
            "touch-pan-y select-none",
            !single && "cursor-grab active:cursor-grabbing",
          )}
        >
          <div
            className={cn(
              "flex gap-4",
              dragDx === null && "transition-transform duration-300 ease-out",
            )}
            style={{ transform: translate }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="w-[85%] shrink-0"
              >
                <NiceOneBundleCard item={item} pricesLoading={pricesLoading} />
              </div>
            ))}
          </div>
        </div>

        {/* Slim edge chevrons (desktop, as in the real site / target image) */}
        {!single && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => clamp(i - 1))}
              aria-label={t("previousSlide")}
              disabled={index === 0}
              className="absolute top-1/2 start-0 flex size-7 -translate-y-1/2 items-center justify-center text-text-secondary/80 transition hover:text-primary disabled:pointer-events-none disabled:opacity-0 lg:flex"
            >
              <PrevChevron className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => clamp(i + 1))}
              aria-label={t("nextSlide")}
              disabled={index === items.length - 1}
              className="absolute top-1/2 end-0 flex size-7 -translate-y-1/2 items-center justify-center text-text-secondary/80 transition hover:text-primary disabled:pointer-events-none disabled:opacity-0 lg:flex"
            >
              <NextChevron className="size-5" aria-hidden />
            </button>
          </>
        )}
      </div>

      {/* Dots — centered under the card row (target image) */}
      {!single && (
        <div
          role="group"
          aria-label="Bundle items"
          className="mt-3 flex items-center justify-center gap-1.5"
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index}
              aria-label={`${i + 1}`}
              className={cn(
                "size-2 rounded-full transition-colors",
                i === index ? "bg-text-primary" : "bg-text-muted/40 hover:bg-text-muted/60",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function NiceOneBundleCard({
  item,
  pricesLoading,
}: {
  item: RelatedProduct;
  pricesLoading: boolean;
}) {
  const tPdp = useTranslations("niceOnePdp");
  const tProduct = useTranslations("product");
  const locale = useLocale();
  const { code: currencyCode, decimalPlaces } = useDisplayCurrency(item.currency);
  const { quantity: cartQuantity, isPending, addItem, increment, decrement } = useCartActions(item.id);
  const inStock = item.quantity > 0;

  const displayPrice = getDisplayPrice(item);
  const originalPrice = getOriginalPrice(item);
  const discountPercent = getDiscountPercent(item);
  const formatPrice = (v: number) => formatNumber(v, locale, decimalPlaces);

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
    <div className="flex h-full items-center justify-between gap-3 rounded-lg border border-line bg-white p-3 shadow-elev-1">
      <Link href={href} className="group flex min-w-0 items-center gap-3" draggable={false}>
        <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded bg-page-gray p-1">
          {item.image?.thumbnail ? (
            <Image
              src={item.image.thumbnail}
              alt={item.name}
              width={56}
              height={56}
              sizes="56px"
              className="max-h-full max-w-full object-contain"
              loading="lazy"
              draggable={false}
            />
          ) : null}
        </span>
        <span className="block min-w-0">
          <span className="block truncate text-xs font-semibold text-text-primary group-hover:text-primary">
            {item.name}
          </span>
          <span className="mt-1 flex flex-wrap items-baseline gap-1.5" dir="ltr">
            {pricesLoading ? (
              <Skeleton className="h-3 w-16" />
            ) : (
              <>
                <span className="text-xs font-bold text-discount">
                  {formatPrice(displayPrice)} <span className="text-[9px]">{currencyCode}</span>
                </span>
                {originalPrice > displayPrice && (
                  <span className="text-[10px] text-text-muted line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                {discountPercent != null && (
                  <span className="rounded bg-primary-tint px-1 text-[10px] font-bold text-discount">
                    -{discountPercent}%
                  </span>
                )}
              </>
            )}
          </span>
        </span>
      </Link>

      {cartQuantity > 0 ? (
        <QuantityStepper
          value={cartQuantity}
          onIncrement={() => increment()}
          onDecrement={() => decrement()}
          decrementAsRemove
          disabled={isPending}
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
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-text-secondary transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
