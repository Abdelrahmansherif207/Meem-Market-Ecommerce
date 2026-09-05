"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import type { SubCategory } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper/types";
import { cn } from "@/shared/utils/cn";
import { AllCategoryIcon } from "@/components/ui/icons/AllCategoryIcon";

interface CategorySliderProps {
  subCategories: SubCategory[];
  currentSlug: string;
  parentSlug: string;
}

export default function CategorySlider({
  subCategories,
  currentSlug,
  parentSlug,
}: CategorySliderProps) {
  const t = useTranslations("header.categoryNav");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();

  if (!subCategories || subCategories.length === 0) return null;

  const circleClasses = (isActive: boolean) =>
    cn(
      "flex h-[96px] w-[96px] items-center justify-center rounded-full border transition-all duration-200 group-hover:scale-[1.04] group-hover:shadow-elev-2",
      isActive
        ? "border-primary bg-primary/10 shadow-elev-1 ring-2 ring-primary/25"
        : "border-border bg-gradient-to-b from-white to-surface group-hover:border-primary/40",
    );

  const labelClasses = (isActive: boolean) =>
    cn(
      "relative px-1 text-sm font-medium leading-tight text-center transition-colors",
      isActive
        ? "text-primary after:absolute after:inset-x-2 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-primary"
        : "text-text-secondary group-hover:text-primary",
    );

  const imageSrc = (image: SubCategory["image"] | undefined) =>
    image?.desktop || image?.mobile;

  return (
    <div className="relative w-full pb-6 mb-4">
      <div className="overflow-hidden">
        <Swiper
          key={locale}
          dir={isRtl ? "rtl" : "ltr"}
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView="auto"
          watchOverflow={true}
          onSwiper={(s) => {
            setSwiper(s);
            setIsLocked(s.isLocked);
          }}
          onLock={() => setIsLocked(true)}
          onUnlock={() => setIsLocked(false)}
          className="w-full"
        >
          <SwiperSlide className="w-auto!">
            <Link
              href={`/category/${parentSlug}`}
              className="group flex w-[120px] flex-col items-center gap-3 py-1"
            >
              <div className={circleClasses(currentSlug === parentSlug)}>
                <AllCategoryIcon
                  className={cn(
                    "h-[44px] w-[44px] rounded-full stroke-2 transition-colors",
                    currentSlug === parentSlug
                      ? "text-primary"
                      : "text-text-muted",
                  )}
                />
              </div>
              <span className={labelClasses(currentSlug === parentSlug)}>
                {t("all")}
              </span>
            </Link>
          </SwiperSlide>

          {subCategories.map((subcat) => {
            const isActive = currentSlug === subcat.slug;
            const src = imageSrc(subcat.image);
            return (
              <SwiperSlide key={subcat.id} className="w-auto!">
                <Link
                  href={`/category/${subcat.slug}`}
                  className="group flex w-[120px] flex-col items-center gap-3 py-1"
                >
                  <div className={circleClasses(isActive)}>
                    {src && (
                      <div className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full bg-white shadow-elev-1">
                        <Image
                          src={src}
                          alt={subcat.name}
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <span className={labelClasses(isActive)}>{subcat.name}</span>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Navigation Arrows */}
      {!isLocked && (
        <>
          <button
            onClick={onPrevious}
            aria-label={isRtl ? "Next" : "Previous"}
            className={cn(
              "absolute top-12 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-elev-2 text-text-secondary transition-colors hover:bg-surface hover:text-primary",
              isRtl ? "-right-4" : "-left-4",
            )}
          >
            {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button
            onClick={onNext}
            aria-label={isRtl ? "Previous" : "Next"}
            className={cn(
              "absolute top-12 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-elev-2 text-text-secondary transition-colors hover:bg-surface hover:text-primary",
              isRtl ? "-left-4" : "-right-4",
            )}
          >
            {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </>
      )}
    </div>
  );
}