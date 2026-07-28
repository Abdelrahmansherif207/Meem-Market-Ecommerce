"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Autoplay, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";

import { BannerArrows, BannerPagination } from "@/features/home/components/banner";
import type { Slider } from "../types";

interface SliderHeroClientProps {
  sliders: Slider[];
}

const AUTO_PLAY_MS = 5000;

function SliderSlideImage({ slider, isFirst }: { slider: Slider; isFirst: boolean }) {
  return (
    <picture className="block h-full w-full">
      <source media="(min-width: 640px)" srcSet={slider.image.desktop} />
      <img
        src={slider.image.mobile}
        alt={slider.title}
        className="h-full w-full object-cover object-center"
        loading={isFirst ? "eager" : "lazy"}
      />
    </picture>
  );
}

export default function SliderHeroClient({ sliders }: SliderHeroClientProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const total = sliders.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  const goTo = (index: number) => {
    if (!swiper) return;
    if (swiper.params.loop) {
      swiper.slideToLoop(index);
      return;
    }
    swiper.slideTo(index);
  };

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();

  useEffect(() => {
    swiper?.changeLanguageDirection(isRtl ? "rtl" : "ltr");
  }, [isRtl, swiper]);

  return (
    <section className="w-full" dir={isRtl ? "rtl" : "ltr"} aria-label="Hero sliders">
      <div className="group relative h-[170px] w-full overflow-hidden rounded-[20px] sm:h-[230px] lg:h-[300px]">
        <Swiper
          modules={[Autoplay, Keyboard]}
          loop={total > 1}
          speed={700}
          slidesPerView={1}
          keyboard={{ enabled: true }}
          autoplay={
            total > 1
              ? {
                  delay: AUTO_PLAY_MS,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          onSwiper={(instance) => {
            setSwiper(instance);
            setCurrentIndex(instance.realIndex);
          }}
          onRealIndexChange={(instance) => setCurrentIndex(instance.realIndex)}
          className="h-full w-full"
        >
          {sliders.map((slider, index) => (
            <SwiperSlide key={slider.id} className="h-full">
              <a
                href={`/${locale}/sliders/${slider.slug}`}
                className="relative block h-full w-full overflow-hidden rounded-sm bg-surface"
              >
                <SliderSlideImage slider={slider} isFirst={index === 0} />
                {slider.title && (
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8">
                    <h2 className="text-white text-lg sm:text-2xl lg:text-3xl font-bold drop-shadow-md line-clamp-2">
                      {slider.title}
                    </h2>
                  </div>
                )}
              </a>
            </SwiperSlide>
          ))}
        </Swiper>

        {total > 1 && (
          <>
            <BannerArrows
              onPrevious={onPrevious}
              onNext={onNext}
              isRtl={isRtl}
              className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
            />
            <BannerPagination
              total={total}
              currentIndex={currentIndex}
              onSelect={goTo}
              className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
            />
          </>
        )}
      </div>
    </section>
  );
}
