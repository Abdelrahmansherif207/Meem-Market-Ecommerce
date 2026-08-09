"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import type { Swiper as SwiperType } from "swiper/types";
import SectionTitle from "@/components/ui/SectionTitle";
import ContentItem from "../contentSection/ContentItem";
import BannerArrows from "../banner/BannerArrows";
import type { HomeCategory } from "../../types";

interface CategoryGridSliderProps {
  title?: string;
  categories: HomeCategory[];
  isCircle?: boolean;
  autoplay?: boolean;
  sliderSpeed?: number;
}

const ROW_LIMIT = 2;

function getColumnsForWidth(width: number) {
  if (width >= 1024) return 8;
  if (width >= 768) return 6;
  if (width >= 640) return 4;
  return 3;
}

export default function CategoryGridSlider({
  title,
  categories,
  isCircle,
  autoplay = true,
  sliderSpeed = 4500,
}: CategoryGridSliderProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const update = () => setColumns(getColumnsForWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const itemsPerSlide = columns * ROW_LIMIT;

  const pages = useMemo(() => {
    const result: HomeCategory[][] = [];
    for (let i = 0; i < categories.length; i += itemsPerSlide) {
      result.push(categories.slice(i, i + itemsPerSlide));
    }
    return result;
  }, [categories, itemsPerSlide]);

  if (!categories || categories.length === 0) return null;

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();

  return (
    <div className="relative w-full">
      {title && <SectionTitle title={title} />}
      <div className="overflow-hidden">
        <Swiper
          key={`${locale}-${columns}`}
          dir={isRtl ? "rtl" : "ltr"}
          modules={[Autoplay]}
          slidesPerView={1}
          spaceBetween={0}
          loop={pages.length > 1}
          speed={700}
          watchOverflow={true}
          onSwiper={setSwiper}
          autoplay={
            autoplay && pages.length > 1
              ? { delay: sliderSpeed, disableOnInteraction: false, pauseOnMouseEnter: true }
              : false
          }
          className="w-full"
        >
          {pages.map((page, index) => (
            <SwiperSlide key={index}>
              <div className="grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:gap-x-6">
                {page.map((category) => (
                  <ContentItem key={category.id} item={category} isCircle={isCircle} />
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {pages.length > 1 && (
        <BannerArrows
          onPrevious={onPrevious}
          onNext={onNext}
          isRtl={isRtl}
          variant="card"
          strokeWidth={2}
          iconClassName="h-4 w-4"
        />
      )}
    </div>
  );
}
