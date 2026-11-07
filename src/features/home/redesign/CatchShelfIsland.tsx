"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCurrencyRefetch } from "@/features/currencies";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";
import { SectionHeader } from "@/components/ui/SectionHeader";
import ProductCard from "@/features/products/components/ProductCard";
import {
  getBannerSectionItemsAction,
  getFlashSaleHomeItemsAction,
  getProductSliderItemsAction,
} from "../actions/homeCurrencyActions";
import type { ProductItem } from "../types";
import CatchCountdown from "./CatchCountdown";

interface CatchShelfIslandProps {
  fetchKind: "products" | "flash-sales" | "banner";
  endpoint: string;
  locale: string;
  title?: string;
  initialItems: ProductItem[];
  columnsCount?: number;
  badgeText?: string;
  /** Extra header action (e.g. a countdown) rendered on the end side. */
  headerAction?: ReactNode;
  /** CMS timer setting — renders a countdown chip in the header. */
  showTimer?: boolean;
  timerEndAt?: string;
}

/**
 * Catch Beauty product shelf: a fluid Swiper (2 mobile / 3 tablet / 5 desktop)
 * rendering every CMS product, with currency-driven refetches and optional
 * CMS countdown. Presentation only — all card behavior lives in ProductCard.
 */
export default function CatchShelfIsland({
  fetchKind,
  endpoint,
  locale,
  title,
  initialItems,
  badgeText,
  headerAction,
  showTimer,
  timerEndAt,
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

  const action =
    headerAction ??
    (showTimer && timerEndAt ? <CatchCountdown endsAt={timerEndAt} /> : null);

  return (
    <section className="w-full" aria-label={title}>
      {title ? (
        <SectionHeader title={title} action={action} className="mb-4" />
      ) : action ? (
        <div className="mb-4 flex justify-end">{action}</div>
      ) : null}

      <div className="relative">
        <Swiper
          key={locale_}
          dir={isRtl ? "rtl" : "ltr"}
          slidesPerView={2}
          spaceBetween={12}
          breakpoints={{
            768: { slidesPerView: 3, spaceBetween: 14 },
            1280: { slidesPerView: 5, spaceBetween: 16 },
          }}
          grabCursor
          watchOverflow
          keyboard
          onSwiper={(s) => {
            setSwiper(s);
            setIsLocked(s.isLocked);
          }}
          onLock={() => setIsLocked(true)}
          onUnlock={() => setIsLocked(false)}
          className="catch-shelf-swiper w-full"
        >
          {safeItems.map((product) => (
            <SwiperSlide key={product.id} className="!h-auto">
              <ProductCard
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
              aria-label={t("shelf.previous")}
              onClick={() => swiper?.slidePrev()}
              className="absolute -start-2 top-[36%] z-20 hidden h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-catch-border-soft bg-white/95 text-catch-charcoal shadow-elev-2 transition-all hover:bg-white active:scale-95 md:flex"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              aria-label={t("shelf.next")}
              onClick={() => swiper?.slideNext()}
              className="absolute -end-2 top-[36%] z-20 hidden h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-catch-border-soft bg-white/95 text-catch-charcoal shadow-elev-2 transition-all hover:bg-white active:scale-95 md:flex"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
