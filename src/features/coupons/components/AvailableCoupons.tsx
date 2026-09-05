"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Copy, Check } from "lucide-react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";

import { BannerArrows } from "@/features/home/components/banner";
import { couponService } from "../services/couponService";
import { CouponCardSkeleton } from "./skeletons/CouponSkeleton";
import type { Coupon } from "../types";

interface AvailableCouponsProps {
  onSelectCoupon: (coupon: Coupon) => void;
}

export default function AvailableCoupons({ onSelectCoupon }: AvailableCouponsProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    couponService.getCoupons(locale).then((data) => {
      if (cancelled) return;
      setCoupons(data);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [locale]);

  if (loading) {
    return (
      <div className="w-full rounded-xl border-2 border-border">
        <CouponCardSkeleton />
      </div>
    );
  }

  if (coupons.length === 0) return null;

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();

  const handleCopy = async (coupon: Coupon) => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopiedId(coupon.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* clipboard not available */ }
  };

  return (
    <div className="space-y-3 rounded-2xl border-2 border-border bg-white p-5">
      <h4 className="text-sm font-medium text-text-secondary">Available Coupons</h4>

      <div className="relative">
        <Swiper
          key={locale}
          dir={isRtl ? "rtl" : "ltr"}
          modules={[Navigation]}
          slidesPerView={1}
          spaceBetween={12}
          watchOverflow
          onSwiper={setSwiper}
          onRealIndexChange={(s) => setCurrentIndex(s.realIndex)}
          className="w-full"
        >
          {coupons.map((coupon) => (
            <SwiperSlide key={coupon.id}>
              <div
                className="mx-auto w-64 rounded-xl overflow-hidden border-2 cursor-pointer transition-shadow hover:shadow-md"
                style={{ borderColor: coupon.borderColor || "#ede4e2" }}
              >
                <button
                  type="button"
                  className="relative w-full aspect-[6/7] bg-surface overflow-hidden"
                  onClick={() => onSelectCoupon(coupon)}
                  title={`Use code: ${coupon.code}`}
                >
                  <Image
                    src={coupon.image.desktop || coupon.image.mobile}
                    alt={coupon.name}
                    width={288}
                    height={336}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
                <div className="p-2 space-y-1">
                  <p className="text-xs font-medium text-text-primary truncate">{coupon.name}</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleCopy(coupon); }}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors"
                  >
                    {copiedId === coupon.id ? (
                      <><Check className="h-3 w-3" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy code</>
                    )}
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {coupons.length > 1 && (
          <BannerArrows
            onPrevious={onPrevious}
            onNext={onNext}
            isRtl={isRtl}
            variant="card"
            strokeWidth={2}
            iconClassName="h-4 w-4"
            className="max-md:hidden"
          />
        )}
      </div>

      {coupons.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          {coupons.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to coupon ${index + 1}`}
              onClick={() => swiper?.slideTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-6 bg-primary" : "w-2 bg-border hover:bg-primary/40"
              }`}
            />
          ))}
          <span className="ml-2 text-xs font-medium tabular-nums text-text-secondary">
            {currentIndex + 1} / {coupons.length}
          </span>
        </div>
      )}
    </div>
  );
}