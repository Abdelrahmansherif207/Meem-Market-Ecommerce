"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import type { Swiper as SwiperType } from "swiper/types";
import type { SubCategory } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface CategorySliderProps {
  subCategories: SubCategory[];
  currentSlug: string;
  parentSlug: string;
}

/**
 * Nice One category chip strip (from the real niceonesa.com DOM):
 * a draggable Swiper of rounded-full pill chips — active category rendered
 * as a non-clickable ink pill (`bg-[#1a1a1a]`, `pointer-events-none`
 * equivalent), other categories as light pills (`#f6f6f6` / `#4e4e4e`,
 * border `#e0e0e0`) linking to their category page. `spaceBetween: 8`,
 * slides `w-auto`, whitespace-nowrap, 14px medium text.
 *
 * Edge chevrons: a single white circle at the inline-end edge (like the
 * real site) once the strip is scrollable, mirrored by a start-edge
 * chevron after scrolling past the beginning. RTL mirrors automatically.
 */
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
  const [isEnd, setIsEnd] = useState(false);
  const [isStart, setIsStart] = useState(true);

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  if (!subCategories || subCategories.length === 0) return null;

  /** Active chip styling = ink pill; inactive = light pill (real DOM values). */
  const chipClasses = (isActive: boolean) =>
    cn(
      "flex items-center whitespace-nowrap rounded-full border px-4 py-2 text-[14px] font-medium transition-colors",
      isActive
        ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
        : "border-[#e0e0e0] bg-[#f6f6f6] text-[#4e4e4e]",
    );

  const updateEdges = (s: SwiperType) => {
    setIsEnd(s.isEnd);
    setIsStart(s.activeIndex === 0);
  };

  return (
    <div className="group/slider relative w-full max-w-full min-w-0 py-1">
      <div className="overflow-hidden">
        <Swiper
          key={locale}
          dir={isRtl ? "rtl" : "ltr"}
          modules={[Navigation]}
          spaceBetween={8}
          slidesPerView="auto"
          watchOverflow={true}
          grabCursor={true}
          onSwiper={(s) => {
            setSwiper(s);
            setIsLocked(s.isLocked);
            updateEdges(s);
          }}
          onLock={() => setIsLocked(true)}
          onUnlock={() => setIsLocked(false)}
          onReachEnd={() => setIsEnd(true)}
          onReachBeginning={() => setIsStart(true)}
          onFromEdge={() => {
            setIsEnd(false);
            setIsStart(false);
          }}
          onUpdate={updateEdges}
          className="w-full"
        >
          {/* First pill — the parent / "All Products" chip */}
          <SwiperSlide className="w-auto!">
            {currentSlug === parentSlug ? (
              <span className={chipClasses(true)} aria-current="page">
                {t("allProducts")}
              </span>
            ) : (
              <Link href={`/category/${parentSlug}`} className="inline-flex">
                <span className={chipClasses(false)}>{t("allProducts")}</span>
              </Link>
            )}
          </SwiperSlide>

          {subCategories.map((subcat) => {
            const isActive = currentSlug === subcat.slug;
            return (
              <SwiperSlide key={subcat.id} className="w-auto!">
                {isActive ? (
                  <span className={chipClasses(true)} aria-current="page">
                    {subcat.name}
                  </span>
                ) : (
                  <Link
                    href={`/category/${subcat.slug}`}
                    className="inline-flex cursor-pointer"
                  >
                    <span className={chipClasses(false)}>{subcat.name}</span>
                  </Link>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Edge chevrons — next at the inline end (persistent, like the real site) */}
      {!isLocked && (
        <>
          {!isStart && (
            <button
              type="button"
              onClick={onPrevious}
              aria-label={isRtl ? "Next" : "Previous"}
              className="absolute top-1/2 start-0 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-800 shadow-elev-1 transition-colors hover:text-black"
            >
              <PrevIcon size={16} aria-hidden />
            </button>
          )}
          {!isEnd && (
            <button
              type="button"
              onClick={onNext}
              aria-label={isRtl ? "Previous" : "Next"}
              className="absolute top-1/2 end-0 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-800 shadow-elev-1 transition-colors hover:text-black"
            >
              <NextIcon size={16} aria-hidden />
            </button>
          )}
        </>
      )}
    </div>
  );
}
