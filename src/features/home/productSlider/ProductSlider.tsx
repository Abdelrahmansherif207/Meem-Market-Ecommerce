"use client";
import ProductCard from "@/components/ui/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { BannerArrows } from "../components/banner";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import type { ProductSliderProps } from "../types";

export default function ProductSlider({
  title,
  items,
  columnsCount,
  badgeText,
  showTimer,
  timerEndAt,
  theme,
  autoplay = true,
  sliderSpeed = 4500,
}: ProductSliderProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const cols = columnsCount ?? 5;

  const onPrevious = () => swiper?.slidePrev();
  const onNext = () => swiper?.slideNext();

  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return null;
  }

  return (
    <div className="group relative w-full overflow-hidden pb-4 px-6 sm:px-10 lg:px-12">
      {title && <SectionTitle title={title} />}
      <div className="overflow-hidden">
      <Swiper
        key={locale}
        dir={isRtl ? "rtl" : "ltr"}
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={8}
        slidesPerView={Math.min(cols, 2)}
        autoplay={
          autoplay && safeItems.length > 1
            ? { delay: sliderSpeed ?? 4500, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        onSwiper={(s) => {
          setSwiper(s);
          setIsLocked(s.isLocked);
        }}
        onLock={() => setIsLocked(true)}
        onUnlock={() => setIsLocked(false)}
        loop={safeItems.length >= 6}
        watchOverflow={true}
        breakpoints={{
          480: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 8 },
        }}
        className="w-full"
      >
        {safeItems.map((product, index) => (
          <SwiperSlide key={product.id}>
            <ProductCard
              theme={theme}
              image={product.image}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              currency="K.D"
              productId={product.id}
              slug={product.slug}
              sku={product.sku}
              inStock={product.inStock}
              stockQuantity={product.stockQuantity}
              priority={index < Math.round(cols)}
              hasVariants={product.hasVariants}
              badgeText={badgeText}
              deliveryType={product.isFastShippingAvailable ? "fast" : "scheduled"}
              isInStock={product.isInStock}
              inWishlist={product.inWishlist}
              tags={product.tags}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      </div>

      {!isLocked && (
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
