"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";
import type { Slider } from "@/features/sliders/types";

interface CatchHeroSliderProps {
  sliders: Slider[];
  autoplay?: boolean;
  sliderSpeed?: number;
}

/**
 * Screen hero: full-width `rounded-2xl` carousel with white circular
 * prev/next arrows. Autoplay/speed come from the CMS section settings.
 */
export default function CatchHeroSlider({
  sliders,
  autoplay = true,
  sliderSpeed = 5000,
}: CatchHeroSliderProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  if (sliders.length === 0) return null;
  const single = sliders.length === 1;

  return (
    <section className="group relative w-full overflow-hidden rounded-xl md:rounded-md">
      <Swiper
        key={locale}
        dir={isRtl ? "rtl" : "ltr"}
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={!single}
        autoplay={
          autoplay && !single
            ? { delay: sliderSpeed, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        onSwiper={(s) => {
          setSwiper(s);
          setIsLocked(s.isLocked);
        }}
        onLock={() => setIsLocked(true)}
        onUnlock={() => setIsLocked(false)}
        className="w-full"
      >
        {sliders.map((slider) => (
          <SwiperSlide key={slider.id}>
            <Link href={`/sliders/${slider.slug}`} className="block">
              <Image
                src={slider.image.desktop}
                alt={slider.title}
                width={1500}
                height={377}
                priority
                className="aspect-auto w-full rounded-xl md:rounded-md"
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {!isLocked && (
        <>
          <button
            type="button"
            aria-label="Previous Slide"
            onClick={() => swiper?.slidePrev()}
            className="absolute start-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-md transition-all hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Next Slide"
            onClick={() => swiper?.slideNext()}
            className="absolute end-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-md transition-all hover:bg-white"
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2.5} />
          </button>
        </>
      )}
    </section>
  );
}
