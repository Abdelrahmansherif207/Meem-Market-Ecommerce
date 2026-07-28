"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Autoplay, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";

import { BannerArrows } from "@/features/home/components/banner";
import CountdownTimer from "./CountdownTimer";
import type { FlashSale } from "../types";

interface FlashSaleBannerClientProps {
  flashSales: FlashSale[];
  locale: string;
}

export default function FlashSaleBannerClient({ flashSales }: FlashSaleBannerClientProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const total = flashSales.length;
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();

  useEffect(() => {
    swiper?.changeLanguageDirection(isRtl ? "rtl" : "ltr");
  }, [isRtl, swiper]);

  return (
    <section className="w-full group" dir={isRtl ? "rtl" : "ltr"} aria-label="Flash sales">
      <div className="relative h-[200px] w-full overflow-hidden rounded-[20px] sm:h-[260px] lg:h-[340px]">
        <Swiper
          modules={[Autoplay, Keyboard]}
          loop={total > 1}
          speed={700}
          slidesPerView={1}
          keyboard={{ enabled: true }}
          autoplay={total > 1 ? { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
          onSwiper={setSwiper}
          className="h-full w-full"
        >
          {flashSales.map((fs) => (
            <SwiperSlide key={fs.id} className="h-full">
              <a
                href={`/${locale}/flash-sales/${fs.slug}`}
                className="relative block h-full w-full overflow-hidden"
              >
                <picture className="block h-full w-full">
                  <source media="(min-width: 640px)" srcSet={fs.image.desktop} />
                  <img
                    src={fs.image.mobile}
                    alt={fs.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8 flex flex-col gap-2">
                  <h2 className="text-white text-lg sm:text-2xl lg:text-3xl font-bold drop-shadow-md line-clamp-2">
                    {fs.name}
                  </h2>
                  {fs.description && (
                    <p className="text-white/90 text-sm sm:text-base line-clamp-1 drop-shadow-md">
                      {fs.description}
                    </p>
                  )}
                  <CountdownTimer targetDate={fs.end_date} />
                </div>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>

        {total > 1 && (
          <BannerArrows
            onPrevious={onPrevious}
            onNext={onNext}
            isRtl={isRtl}
            className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
          />
        )}
      </div>
    </section>
  );
}
