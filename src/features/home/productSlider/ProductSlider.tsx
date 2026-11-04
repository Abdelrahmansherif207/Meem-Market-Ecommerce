"use client";
import CatchProductCard from "@/features/home/redesign/CatchProductCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { BannerArrows } from "../components/banner";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import type { ProductSliderProps } from "../types";

export default function ProductSlider({
  title,
  items,
  columnsCount,
  badgeText,
  theme,
  autoplay = true,
  sliderSpeed = 4500,
  pricesLoading = false,
}: ProductSliderProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  // Card widths are designed for up to 8 columns; clamp admin `columns_count`.
  const cols = Math.max(1, Math.min(8, Math.round(columnsCount ?? 5)));

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();

  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return null;
  }

  return (
    <div className="group relative w-full overflow-hidden pb-4 px-6 sm:px-10 lg:px-12">
      {title && <SectionTitle title={title} />}
      <div className="overflow-hidden">
      <Swiper
        key={locale}
        dir={isRtl ? "rtl" : "ltr"}
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={8}
        slidesPerView={Math.min(cols, 2)}
        autoplay={
          autoplay && safeItems.length > 1
            ? { delay: sliderSpeed ?? 4500, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        onSwiper={(s) => {
          setSwiper(s);
          setIsLocked(s.isLocked);
        }}
        onLock={() => setIsLocked(true)}
        onUnlock={() => setIsLocked(false)}
        loop={safeItems.length >= 6}
        watchOverflow={true}
        breakpoints={{
          480: { slidesPerView: Math.min(3, cols) },
          768: { slidesPerView: Math.min(4, cols) },
          1024: { slidesPerView: cols },
        }}
        className="w-full"
      >
        {safeItems.map((product) => (
          <SwiperSlide key={product.id}>
            <CatchProductCard
              item={product}
              badgeText={badgeText}
              pricesLoading={pricesLoading}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      </div>

      {!isLocked && (
        <BannerArrows
          onPrevious={onPrevious}
          onNext={onNext}
          isRtl={isRtl}
          variant="card"
          strokeWidth={2}
          iconClassName="h-4 w-4"
        />
      )}
    </div>
  );
}
