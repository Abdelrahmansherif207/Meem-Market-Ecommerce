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
  /** Admin front setting `columns_count` (columns on large screens). */
  columnsCount?: number;
  /** Admin front setting `layout`: "grid" renders a static grid without the carousel. */
  layout?: "grid" | "slider" | "list";
}

const ROW_LIMIT = 2;

function getColumnsForWidth(width: number, columnsCount?: number) {
  const max = Math.max(1, columnsCount ?? 8);
  if (width >= 1024) return max;
  if (width >= 768) return Math.min(6, max);
  if (width >= 640) return Math.min(4, max);
  return Math.min(3, max);
}

export default function CategoryGridSlider({
  title,
  categories,
  isCircle,
  autoplay = true,
  sliderSpeed = 4500,
  columnsCount,
  layout,
}: CategoryGridSliderProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [columns, setColumns] = useState(() => getColumnsForWidth(0, columnsCount));

  useEffect(() => {
    const update = () => setColumns(getColumnsForWidth(window.innerWidth, columnsCount));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [columnsCount]);

  const isGrid = layout === "grid";
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

  // Shared per-breakpoint column sizing for both layouts (inline style keeps
  // arbitrary column counts working without generated utility classes).
  const gridStyle = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };

  const renderItems = (page: HomeCategory[]) =>
    page.map((category) => (
      <ContentItem key={category.id} item={category} isCircle={isCircle} />
    ));

  if (isGrid) {
    return (
      <div className="relative w-full">
        {title && <SectionTitle title={title} />}
        <div className="grid gap-x-4 gap-y-4 xl:gap-x-6" style={gridStyle}>
          {renderItems(categories)}
        </div>
      </div>
    );
  }

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
              <div className="grid gap-x-4 gap-y-4 xl:gap-x-6" style={gridStyle}>
                {renderItems(page)}
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
