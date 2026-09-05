"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { getImageProps } from "next/image";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";

import SectionTitle from "@/components/ui/SectionTitle";
import { cn } from "@/shared/utils/cn";

import { BannerArrows } from "@/features/home/components/banner";
import type { Coupon } from "../types";
import styles from "./CouponsVouchersSwiper.module.css";

const FALLBACK_BORDER_COLOR = "#ede4e2";

const IMAGE_SIZES =
  "(max-width: 480px) 75vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw";

function CouponCard({ coupon, priority = false }: { coupon: Coupon; priority?: boolean }) {
  const hasBorder = !coupon.borderless;
  const desktopSrc = coupon.image?.desktop || coupon.image?.mobile;
  const mobileSrc = coupon.image?.mobile || coupon.image?.desktop;

  const imageProps = {
    alt: coupon.name,
    fill: true,
    sizes: IMAGE_SIZES,
    priority,
    className: cn("rounded-xl object-cover", hasBorder && "p-1"),
  };

  const picture = desktopSrc ? (
    <picture className="block h-full w-full">
      <source
        media="(min-width: 640px)"
        srcSet={getImageProps({ ...imageProps, src: desktopSrc }).props.srcSet}
      />
      <img {...getImageProps({ ...imageProps, src: mobileSrc || desktopSrc }).props} alt={coupon.name} />
    </picture>
  ) : null;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl aspect-3/4 transition-shadow duration-300 hover:shadow-lg",
        hasBorder && "border-2",
      )}
      style={hasBorder ? { borderColor: coupon.borderColor || FALLBACK_BORDER_COLOR } : undefined}
    >
      {picture ?? (
        <span className="absolute inset-0 flex items-center justify-center p-2 text-center text-sm font-medium text-text-primary">
          {coupon.name}
        </span>
      )}
    </div>
  );
}

interface CouponsVouchersSwiperProps {
  title?: string;
  coupons: Coupon[];
  autoplay?: boolean;
  sliderSpeed?: number;
}

export default function CouponsVouchersSwiper({
  title,
  coupons,
  autoplay,
  sliderSpeed,
}: CouponsVouchersSwiperProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();
  const shouldShowArrows = !isLocked && coupons.length > 1;

  return (
    <section className={cn("group relative w-full overflow-hidden pb-4", styles.slider)}>
      {title ? <SectionTitle title={title} /> : null}
      {/* overflow-hidden clips the partial slide without hiding external arrows */}
      <div className="overflow-hidden">
        <Swiper
          key={locale}
          dir={isRtl ? "rtl" : "ltr"}
          modules={[Autoplay, Navigation]}
          spaceBetween={12}
          autoplay={
            autoplay && coupons.length > 1
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
          loop={coupons.length >= 6}
          watchOverflow
          breakpoints={{
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="w-full"
        >
          {coupons.map((coupon, index) => (
            <SwiperSlide key={coupon.id}>
              <CouponCard coupon={coupon} priority={index === 0} />
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
