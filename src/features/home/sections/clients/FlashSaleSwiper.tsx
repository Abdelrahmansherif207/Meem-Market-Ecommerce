"use client";

import { useEffect, useState } from "react";
import { A11y, Autoplay, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import { useLocale } from "next-intl";

import "swiper/css";

import { BannerArrows } from "@/features/home/components/banner";
import HomeCountdown from "./HomeCountdown";
import type { FlashSale } from "@/features/flash-sales/types";

interface FlashSaleSwiperProps {
  flashSales: FlashSale[];
}

const AUTO_PLAY_MS = 6000;

/**
 * Sovereign Rose flash-deal banner (Stitch: countdown strip pattern).
 * Charcoal-panel creative from the backend flash-sales API with a serif
 * title, one-line description and the glass countdown chip. The whole
 * slide links to the existing flash-sale route.
 */
export default function FlashSaleSwiper({ flashSales }: FlashSaleSwiperProps) {
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
    <section className="home-container group" dir={isRtl ? "rtl" : "ltr"} aria-label="Flash sales">
      <div className="relative h-[300px] w-full overflow-hidden rounded-xl bg-(--home-primary) sm:h-[360px] lg:h-[420px]">
        <Swiper
          key={locale}
          modules={[Autoplay, Keyboard, A11y]}
          loop={total > 1}
          speed={700}
          slidesPerView={1}
          keyboard={{ enabled: true }}
          autoplay={total > 1 ? { delay: AUTO_PLAY_MS, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
          onSwiper={setSwiper}
          className="h-full w-full"
        >
          {flashSales.map((flashSale) => (
            <SwiperSlide key={flashSale.id} className="h-full">
              <a
                href={`/${locale}/flash-sales/${flashSale.slug}`}
                className="group/slide relative block h-full w-full overflow-hidden"
              >
                <picture className="absolute inset-0 block h-full w-full">
                  <source media="(min-width: 640px)" srcSet={flashSale.image.desktop} />
                  <img
                    src={flashSale.image.mobile}
                    alt={flashSale.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/slide:scale-105"
                    loading="lazy"
                  />
                </picture>
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#121214]/95 via-[#121214]/40 to-transparent"
                  aria-hidden
                />
                <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-7 lg:p-10">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-(--home-gold)">
                    {flashSale.name}
                  </span>
                  <h2 className="home-display mt-1 max-w-xl text-2xl font-semibold leading-snug text-white drop-shadow-md line-clamp-2 sm:text-3xl lg:text-4xl">
                    {flashSale.name}
                  </h2>
                  <div className="mt-3 flex items-end gap-4">
                    <HomeCountdown endsAt={flashSale.end_date} />
                  </div>
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
            buttonClassName="size-9 border-0 bg-white/15 text-white backdrop-blur-md hover:bg-white/30 focus-visible:outline-white"
            iconClassName="h-4 w-4"
            strokeWidth={2}
          />
        )}
      </div>
    </section>
  );
}
