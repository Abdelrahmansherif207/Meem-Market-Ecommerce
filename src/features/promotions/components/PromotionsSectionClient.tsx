"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";
import "swiper/css/pagination";

import SectionTitle from "@/components/ui/SectionTitle";
import { cn } from "@/shared/utils/cn";
import { BannerArrows } from "@/features/home/components/banner";
import type { Promotion } from "../types";

interface PromotionsSectionClientProps {
  promotions: Promotion[];
}

export default function PromotionsSectionClient({ promotions }: PromotionsSectionClientProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();
  const shouldShowArrows = !isLocked && promotions.length > 1;

  return (
    <section className="group relative w-full overflow-hidden pb-4">
      <SectionTitle title="Promotions" />
      <div className="overflow-hidden">
        <Swiper
          key={locale}
          dir={isRtl ? "rtl" : "ltr"}
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={16}
          autoplay={promotions.length > 1 ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
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
              <a
                href={`/${locale}/promotions/${promo.slug}`}
                className="relative block w-full overflow-hidden rounded-xl aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5]"
              >
                <picture className="absolute inset-0">
                  <source media="(min-width: 640px)" srcSet={promo.image.desktop} />
                  <img
                    src={promo.image.mobile}
                    alt={promo.name}
                    className="h-full w-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-4 left-4 right-4 text-white text-lg font-bold drop-shadow-md line-clamp-2">
                  {promo.name}
                </span>
              </a>
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
          iconClassName="h-7 w-7"
        />
      ) : null}
    </section>
  );
}
