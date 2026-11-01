"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";
import "swiper/css/pagination";

import SectionTitle from "@/components/ui/SectionTitle";
import { gridColumnsClass } from "@/shared/utils/gridClasses";

import { BannerArrows } from "@/features/home/components/banner";
import type { Promotion } from "../types";

interface PromotionsSectionClientProps {
  promotions: Promotion[];
  title?: string;
  columnsCount?: number;
  /** Admin front setting `layout`: "grid" renders a static grid without the carousel. */
  layout?: "grid" | "slider" | "list";
  autoplay?: boolean;
  sliderSpeed?: number;
}

const DEFAULT_SLIDER_SPEED = 5000;

export default function PromotionsSectionClient({
  promotions,
  title,
  columnsCount,
  layout,
  autoplay,
  sliderSpeed = DEFAULT_SLIDER_SPEED,
}: PromotionsSectionClientProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();
  const shouldShowArrows = !isLocked && promotions.length > 1;
  const autoplayEnabled = autoplay !== false;

  const promoCard = (promo: Promotion, eager: boolean) => (
    <a
      href={`/${locale}/promotions/${promo.slug}`}
      className="relative block w-full overflow-hidden rounded-xl aspect-[16/8] sm:aspect-[16/7] md:aspect-[16/6]"
    >
      <picture className="absolute inset-0">
        <source media="(min-width: 640px)" srcSet={promo.image.desktop} />
        <img
          src={promo.image.mobile}
          alt={promo.name}
          className="h-full w-full object-cover"
          loading={eager ? "eager" : "lazy"}
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <span className="absolute bottom-4 left-4 right-4 text-white text-lg font-bold drop-shadow-md line-clamp-2">
        {promo.name}
      </span>
    </a>
  );

  if (layout === "grid") {
    return (
      <section className="group relative w-full pb-4">
        <SectionTitle title={title || "Promotions"} />
        <div className={`grid gap-4 ${gridColumnsClass(columnsCount, "one")}`}>
          {promotions.map((promo, index) => (
            <div key={promo.id}>{promoCard(promo, index === 0)}</div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="group relative w-full overflow-hidden pb-4">
      <SectionTitle title={title || "Promotions"} />
      <div className="overflow-hidden">
        <Swiper
          key={locale}
          dir={isRtl ? "rtl" : "ltr"}
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={16}
          autoplay={
            autoplayEnabled && promotions.length > 1
              ? { delay: sliderSpeed, disableOnInteraction: false, pauseOnMouseEnter: true }
              : false
          }
          slidesPerView={1.1}
          onSwiper={(s) => { setSwiper(s); setIsLocked(s.isLocked); }}
          onLock={() => setIsLocked(true)}
          onUnlock={() => setIsLocked(false)}
          loop={promotions.length >= 3}
          watchOverflow
          breakpoints={{
            640: { slidesPerView: 1.5 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="w-full"
        >
          {promotions.map((promo, index) => (
            <SwiperSlide key={promo.id}>
              <div className="h-full">{promoCard(promo, index === 0)}</div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {shouldShowArrows ? (
        <BannerArrows
          onPrevious={onPrevious}
          onNext={onNext}
          isRtl={isRtl}
          variant="card"
          strokeWidth={2}
          iconClassName="h-4 w-4"
        />
      ) : null}
    </section>
  );
}
