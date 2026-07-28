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

import { BannerArrows } from "../banner";
import Slide from "./Slide";
import styles from "./CardSlider.module.css";
import type { CardSliderProps } from "../../types";

export default function CardSlider({
  title,
  items,
  autoplay,
  sliderSpeed,
  showArrows = true,
  className,
  cardClassName = "aspect-3/4",
  imageClassName,
  slideSizes,
}: CardSliderProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();
  const shouldShowArrows = showArrows && !isLocked && items.length > 1;

  return (
      <section className={cn("group relative w-full overflow-hidden pb-4", styles.slider, className)}>
      {title ? <SectionTitle title={title} /> : null}
      {/* overflow-hidden clips the partial slide without hiding external arrows */}
      <div className="overflow-hidden">
      <Swiper
        key={locale}
        dir={isRtl ? "rtl" : "ltr"}
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={12}
        autoplay={
          autoplay && items.length > 1
            ? { delay: sliderSpeed ?? 4500, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        slidesPerView={1.3}
        onSwiper={(s) => {
          setSwiper(s);
          setIsLocked(s.isLocked);
        }}
        onLock={() => setIsLocked(true)}
        onUnlock={() => setIsLocked(false)}
        loop={items.length >= 6}
        watchOverflow={true}
        breakpoints={{
          480: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="w-full"
      >
        {items.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <Slide
              slide={slide}
              hasBorder={false}
              aspectClassName={cardClassName}
              imageClassName={imageClassName}
              sizes={slideSizes}
              priority={index === 0}
            />
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
