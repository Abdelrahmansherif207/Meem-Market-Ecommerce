"use client";

import { useEffect, useState } from "react";
import { A11y, Autoplay, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import "swiper/css";

import { BannerArrows, BannerPagination } from "@/features/home/components/banner";
import { useLocale } from "next-intl";

interface HeroSlide {
  id: number;
  title: string;
  slug: string;
  image: { desktop: string; mobile: string };
}

interface HomeHeroSliderProps {
  slides: HeroSlide[];
  autoplay?: boolean;
  sliderSpeed?: number;
}

const AUTO_PLAY_MS = 5000;

/**
 * Sovereign Rose hero (Stitch: charcoal promo panel — `lg:col-span-8`).
 * Full-width panel of the CMS slider creative with the design's charcoal
 * scrim, serif overlay title, hover zoom and glass arrows. The CMS image
 * and title are the only content — nothing is invented.
 */
export default function HomeHeroSlider({
  slides,
  autoplay,
  sliderSpeed,
}: HomeHeroSliderProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const total = slides.length;
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
    <section className="home-container" dir={isRtl ? "rtl" : "ltr"} aria-label="Hero promotions">
      <div className="group relative h-[300px] w-full overflow-hidden rounded-xl bg-(--home-primary) sm:h-[380px] lg:h-[480px]">
        <Swiper
          modules={[Autoplay, Keyboard, A11y]}
          loop={total > 1}
          speed={700}
          slidesPerView={1}
          keyboard={{ enabled: true }}
          a11y={{ enabled: true }}
          autoplay={
            autoplay !== false && total > 1
              ? {
                  delay: sliderSpeed ?? AUTO_PLAY_MS,
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
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.id} className="h-full">
              <a
                href={`/${locale}/sliders/${slide.slug}`}
                className="group/slide relative block h-full w-full overflow-hidden"
              >
                <picture className="absolute inset-0 block h-full w-full">
                  <source media="(min-width: 640px)" srcSet={slide.image.desktop} />
                  <img
                    src={slide.image.mobile}
                    alt={slide.title}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover/slide:scale-105"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </picture>
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#121214]/95 via-[#121214]/40 to-transparent"
                  aria-hidden
                />
                {slide.title && (
                  <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-7 lg:p-10">
                    <h2 className="home-display max-w-xl text-2xl font-semibold leading-snug text-white drop-shadow-md line-clamp-2 sm:text-3xl lg:text-4xl">
                      {slide.title}
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
              buttonClassName="size-9 border-0 bg-white/15 text-white backdrop-blur-md hover:bg-white/30 focus-visible:outline-white"
              iconClassName="h-4 w-4"
              strokeWidth={2}
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
