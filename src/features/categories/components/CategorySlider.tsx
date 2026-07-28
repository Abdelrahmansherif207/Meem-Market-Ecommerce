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
            className="flex flex-col items-center gap-3 w-[120px]"
          >
            <div
              className={cn(
                "w-[120px] h-[120px] rounded-full flex justify-center border transition-colors",
                currentSlug === parentSlug
                  ? "bg-primary border-primary"
                  : "bg-white border-border",
              )}
            >
              <AllCategoryIcon
                className={cn(
                  "rounded-full stroke-2 transition-colors",
                  currentSlug === parentSlug
                    ? "text-white"
                    : "text-primary"
                )}
              />
            </div>
            <span 
              className={cn(
                "text-sm font-medium text-center relative pb-1 transition-colors",
                currentSlug === parentSlug
                  ? "text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[2px] after:bg-primary"
                  : "text-foreground",
              )}
            >
              {t("all")}
            </span>
          </Link>
        </SwiperSlide>

        {subCategories.map((subcat) => {
          const isActive = currentSlug === subcat.slug;
          return (
            <SwiperSlide key={subcat.id} className="w-auto!">
              <Link
                href={`/category/${subcat.slug}`}
                className="flex flex-col items-center gap-3 w-[120px]"
              >
                <div
                  className={cn(
                    "w-[120px] h-[120px] rounded-full overflow-hidden border flex items-end justify-center p-2 transition-colors",
                    isActive
                      ? "bg-primary border-primary"
                      : "bg-white border-border",
                  )}
                >
                  <div className="relative rounded-full overflow-hidden">
                    {subcat.image?.desktop || subcat.image?.mobile ? (
                      <Image
                        src={subcat.image.desktop || subcat.image.mobile}
                        alt={subcat.name}
                        width={60}
                        height={60}
                        className="object-contain"
                      />
                    ) : null}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-sm font-medium text-center line-clamp-2 px-1 relative pb-1 transition-colors",
                    isActive
                      ? "text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[2px] after:bg-primary"
                      : "text-foreground",
                  )}
                >
                  {subcat.name}
                </span>
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
            className={cn(
              "absolute top-[60px] -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center border text-foreground hover:bg-gray-50",
              isRtl ? "-right-5" : "-left-5",
            )}
          >
            {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button
            onClick={onNext}
            className={cn(
              "absolute top-[60px] -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center border text-foreground hover:bg-gray-50",
              isRtl ? "-left-5" : "-right-5",
            )}
          >
            {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </>
      )}
    </div>
  );
}
