"use client";

import { useCallback, useState } from "react";
import { useLocale } from "next-intl";
import { A11y, Autoplay, Keyboard, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import "swiper/css";

import { BannerArrows } from "@/features/home/components/banner";
import { useCurrencyRefetch } from "@/features/currencies";

import {
  getBannerSectionItemsAction,
  getFlashSaleHomeItemsAction,
  getProductSliderItemsAction,
} from "../../actions/homeCurrencyActions";
import HomeProductCard from "./HomeProductCard";
import type { ProductItem } from "../../types";

interface HomeProductRailProps {
  items: ProductItem[];
  /**
   * Which Server Action backs currency-driven refetches (island behavior
   * mirrors `ProductSliderIsland`). Server actions are imported here, not
   * passed as function props — functions cannot cross the server/client
   * boundary. Omit for static rails (no refetch).
   */
  fetchKind?: "products" | "flash-sales" | "banner";
  endpoint?: string;
  locale?: string;
  initialCurrency?: string;
  /** Admin front setting `columns_count` (large-screen columns). */
  columnsCount?: number;
  badgeText?: string;
  autoplay?: boolean;
  sliderSpeed?: number;
}

const clampCols = (value?: number) =>
  Math.max(2, Math.min(8, Math.round(value ?? 5)));

/**
 * Sovereign Rose product rail (Stitch: "Catch Most Wanted" grid family).
 * Currency-aware when `fetchKind` + `endpoint` are provided; prices-only
 * skeletons during refetch — images, titles and badges stay untouched.
 */
export default function HomeProductRail({
  items,
  fetchKind,
  endpoint,
  locale: localeProp,
  initialCurrency,
  columnsCount,
  badgeText,
  autoplay = true,
  sliderSpeed = 4500,
}: HomeProductRailProps) {
  const localeFromHook = useLocale();
  const locale = localeProp ?? localeFromHook;
  const isRtl = locale === "ar";
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const cols = clampCols(columnsCount);

  const staticRefetch = useCallback(
    async () => items,
    [items],
  );

  // Rules of Hooks: the refetch hook always runs; without a fetchKind the
  // action is the no-op above, so no network call ever happens.
  const fetchAction = useCallback(
    (currency: string) => {
      if (!fetchKind || !endpoint) return staticRefetch();
      if (fetchKind === "flash-sales") {
        return getFlashSaleHomeItemsAction(endpoint, locale, currency);
      }
      if (fetchKind === "banner") {
        return getBannerSectionItemsAction(endpoint, locale, currency);
      }
      return getProductSliderItemsAction(endpoint, locale, currency);
    },
    [fetchKind, endpoint, locale, staticRefetch],
  );

  const active = Boolean(fetchKind && endpoint);
  const { data: refetchedItems, isRefreshing } = useCurrencyRefetch(
    fetchAction,
    items,
    active ? initialCurrency : undefined,
  );

  const railItems = active ? refetchedItems : items;
  const pricesLoading = active ? isRefreshing : false;
  const safeItems = Array.isArray(railItems) ? railItems : [];

  if (safeItems.length === 0) return null;

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();

  return (
    <div
      className="group/rail relative w-full overflow-hidden pb-1"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="overflow-hidden">
        <Swiper
          key={`${locale}-${cols}`}
          dir={isRtl ? "rtl" : "ltr"}
          modules={[Autoplay, Navigation, Keyboard, A11y]}
          spaceBetween={12}
          slidesPerView={2}
          loop={safeItems.length >= 6}
          watchOverflow
          speed={600}
          keyboard={{ enabled: true }}
          a11y={{ enabled: true }}
          autoplay={
            autoplay && safeItems.length > 1
              ? {
                  delay: sliderSpeed,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          onSwiper={(instance) => {
            setSwiper(instance);
            setIsLocked(instance.isLocked);
          }}
          onLock={() => setIsLocked(true)}
          onUnlock={() => setIsLocked(false)}
          breakpoints={{
            640: { slidesPerView: Math.min(3, cols), spaceBetween: 12 },
            768: { slidesPerView: Math.min(4, cols), spaceBetween: 14 },
            1024: {
              slidesPerView: Math.min(cols, 5),
              spaceBetween: 16,
            },
            1280: { slidesPerView: cols, spaceBetween: 16 },
          }}
          className="w-full"
        >
          {safeItems.map((product, index) => (
            <SwiperSlide key={product.id} className="h-auto">
              <HomeProductCard
                item={product}
                badgeText={badgeText}
                priority={index < cols}
                pricesLoading={pricesLoading}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {!isLocked && safeItems.length > 1 && (
        <BannerArrows
          onPrevious={onPrevious}
          onNext={onNext}
          isRtl={isRtl}
          className="opacity-0 transition-opacity duration-300 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100"
          buttonClassName="size-11 border border-(--home-stroke) bg-white text-(--home-ink) shadow-sm hover:border-(--home-ink) hover:bg-(--home-ink) hover:text-white focus-visible:outline-(--home-ink)"
          iconClassName="h-4 w-4"
          strokeWidth={2}
        />
      )}
    </div>
  );
}
