"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCurrencyRefetch } from "@/features/currencies";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";
import {
  getBannerSectionItemsAction,
  getFlashSaleHomeItemsAction,
  getProductSliderItemsAction,
} from "../actions/homeCurrencyActions";
import type { ProductItem } from "../types";
import CatchProductCard from "./CatchProductCard";
import CatchCountdown from "./CatchCountdown";

interface CatchShelfIslandProps {
  fetchKind: "products" | "flash-sales" | "banner";
  endpoint: string;
  locale: string;
  title?: string;
  initialItems: ProductItem[];
  columnsCount?: number;
  badgeText?: string;
  /** Static extra node rendered above the slider (e.g. banner image). */
  headerSlot?: React.ReactNode;
  /** CMS timer setting — renders a countdown chip above the slider. */
  showTimer?: boolean;
  timerEndAt?: string;
  showViewAll?: boolean;
}

/** Slide width matches the card's real `min-w-[160px]` so the card never
 * overflows into the 16px `spaceBetween` gap — the card pitch (card + gap)
 * then matches the real site's `margin-right: 16px` slides. */
const SLIDE_WIDTH = 160;

/**
 * Screen-style product shelf (real Nice One anatomy): a swipeable Swiper
 * with fixed 145px slides and 16px gaps rendering every product, with
 * white circular arrows (hidden when all slides fit). Also owns the
 * currency-driven refetches for products / flash-sales / banner
 * sections — same island mechanism as before, presentation only.
 */
export default function CatchShelfIsland({
  fetchKind,
  endpoint,
  locale,
  title,
  initialItems,
  columnsCount,
  badgeText,
  headerSlot,
  showTimer,
  timerEndAt,
  showViewAll = true,
}: CatchShelfIslandProps) {
  const t = useTranslations("catchHome");
  const locale_ = useLocale();
  const isRtl = locale_ === "ar";
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  const fetchAction = useCallback(
    (currency: string) => {
      if (fetchKind === "flash-sales") {
        return getFlashSaleHomeItemsAction(endpoint, locale, currency);
      }
      if (fetchKind === "banner") {
        return getBannerSectionItemsAction(endpoint, locale, currency);
      }
      return getProductSliderItemsAction(endpoint, locale, currency);
    },
    [fetchKind, endpoint, locale],
  );

  const { data: items, isRefreshing } = useCurrencyRefetch(
    fetchAction,
    initialItems,
    initialItems[0]?.currency?.code,
  );

  const safeItems = Array.isArray(items) ? items : [];
  if (safeItems.length === 0) return null;

  // CMS `columns_count` still caps how many slides render per shelf.
  const visible = columnsCount
    ? safeItems.slice(0, Math.max(1, Math.min(20, Math.round(columnsCount) + 3)))
    : safeItems;

  return (
    <section className="w-full">
      {title ? (
        <div className="mb-2.5 flex items-center justify-between md:mb-4">
          <h2 className="text-sm font-bold tracking-tight text-neutral-900 md:text-lg">{title}</h2>
          {showViewAll && (
            <a
              href="#"
              className="text-xs font-semibold text-neutral-700 underline underline-offset-4 transition-colors hover:text-black"
            >
              {t("viewAll")}
            </a>
          )}
        </div>
      ) : null}

      {headerSlot}

      {showTimer && timerEndAt ? (
        <div className="flex justify-start">
          <CatchCountdown endsAt={timerEndAt} />
        </div>
      ) : null}

      <div className="relative w-full">
        <Swiper
          key={locale_}
          dir={isRtl ? "rtl" : "ltr"}
          slidesPerView="auto"
          spaceBetween={16}
          grabCursor
          watchOverflow
          onSwiper={(s) => {
            setSwiper(s);
            setIsLocked(s.isLocked);
          }}
          onLock={() => setIsLocked(true)}
          onUnlock={() => setIsLocked(false)}
          className="w-full"
        >
          {visible.map((product) => (
            <SwiperSlide
              key={product.id}
              className="shrink-0 !h-auto"
              style={{ width: SLIDE_WIDTH }}
            >
              <CatchProductCard
                item={product}
                badgeText={badgeText}
                pricesLoading={isRefreshing}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {!isLocked && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => swiper?.slidePrev()}
              className="absolute start-0 top-1/2 z-20 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-80"
            >
              <Image
                src="/product-nav-left.svg"
                alt=""
                width={32}
                height={32}
                className="rtl:rotate-180"
              />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => swiper?.slideNext()}
              className="absolute end-0 top-1/2 z-20 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-80"
            >
              <Image
                src="/product-nav-right.svg"
                alt=""
                width={32}
                height={32}
                className="rtl:rotate-180"
              />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
