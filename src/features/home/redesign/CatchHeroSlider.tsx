"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";
import "swiper/css/pagination";
import { CampaignImage } from "@/components/ui/CampaignImage";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import type { Slider } from "@/features/sliders/types";

interface CatchHeroSliderProps {
  sliders: Slider[];
  autoplay?: boolean;
  sliderSpeed?: number;
}

/** Live CMS slider artwork is 1150×368 on both art directions. */
const HERO_MEDIA_STYLE = {
  "--media-aspect": "1150 / 368",
  "--media-aspect-mobile": "1150 / 368",
} as CSSProperties;

/**
 * Catch Beauty hero: full-width campaign carousel with a reserved media
 * well, art-directed mobile artwork and white circular arrows/pagination.
 * Autoplay and speed come from the CMS section settings; reduced-motion
 * users get a static first slide.
 */
export default function CatchHeroSlider({
  sliders,
  autoplay = true,
  sliderSpeed = 5000,
}: CatchHeroSliderProps) {
  const t = useTranslations("catchHome");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const prefersReducedMotion = usePrefersReducedMotion();
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  if (sliders.length === 0) return null;
  const single = sliders.length === 1;

  return (
    <section
      className="group relative w-full overflow-hidden rounded-2xl"
      aria-roledescription="carousel"
      aria-label={t("carousel.label")}
    >
      <Swiper
        key={locale}
        dir={isRtl ? "rtl" : "ltr"}
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={!single}
        autoplay={
          autoplay && !single && !prefersReducedMotion
            ? {
                delay: sliderSpeed,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        pagination={
          single
            ? false
            : {
                clickable: true,
              }
        }
        onSwiper={(s) => {
          setSwiper(s);
          setIsLocked(s.isLocked);
        }}
        onLock={() => setIsLocked(true)}
        onUnlock={() => setIsLocked(false)}
        className="catch-hero-swiper w-full"
      >
        {sliders.map((slider) => (
          <SwiperSlide key={slider.id}>
            <Link
              href={`/sliders/${slider.slug}`}
              className="block focus-visible:outline-offset-[-2px]"
            >
              <div className="catch-media-well" style={HERO_MEDIA_STYLE}>
                <CampaignImage
                  desktop={slider.image.desktop}
                  mobile={slider.image.mobile}
                  alt={slider.title}
                  width={1150}
                  height={368}
                  mobileWidth={1150}
                  mobileHeight={368}
                  priority
                  fill
                  sizes="(max-width: 1440px) 100vw, 1440px"
                />
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {!single && !isLocked && (
        <>
          <button
            type="button"
            aria-label={t("carousel.previous")}
            onClick={() => swiper?.slidePrev()}
            className="absolute start-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-catch-charcoal transition-all hover:bg-white active:scale-95 md:start-4 md:h-10 md:w-10"
          >
            <ChevronLeft
              className="h-4 w-4 rtl:rotate-180 md:h-5 md:w-5"
              strokeWidth={2.5}
            />
          </button>
          <button
            type="button"
            aria-label={t("carousel.next")}
            onClick={() => swiper?.slideNext()}
            className="absolute end-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-catch-charcoal transition-all hover:bg-white active:scale-95 md:end-4 md:h-10 md:w-10"
          >
            <ChevronRight
              className="h-4 w-4 rtl:rotate-180 md:h-5 md:w-5"
              strokeWidth={2.5}
            />
          </button>
        </>
      )}
    </section>
  );
}
