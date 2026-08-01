"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Trash2, Plus, Minus } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { useCartActions } from "@/features/cart/hooks/useCartActions";
import type { DeliveryType } from "@/features/cart/types";
import type { ProductTag } from "@/shared/types";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

interface ProductCardProps {
  deliveryType?: DeliveryType;
  image: string;
  title: string;
  price: number;
  originalPrice: number;
  currency?: string;
  discountPercent?: number;
  productId: number;
  slug?: string;
  sku?: string;
  inStock?: number;
  stockQuantity?: number;
  priority?: boolean;
  hasVariants?: boolean;
  badgeText?: string;
  isInStock?: boolean;
  flashSaleActive?: boolean;
  theme?: "light" | "dark";
  tags?: ProductTag[];
}

export default function ProductCard({
  image,
  title,
  price,
  originalPrice,
  currency = "K.D",
  discountPercent,
  productId,
  slug = "",
  sku = "",
  inStock = 10,
  stockQuantity = 10,
  deliveryType = "scheduled",
  priority: priorityProp,
  hasVariants = false,
  badgeText,
  isInStock = true,
  flashSaleActive = false,
  theme = "light",
  tags,
}: ProductCardProps) {
  const isDark = theme === "dark";
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { quantity, isPending, addItem, increment, decrement } = useCartActions(productId);
  const [animating, setAnimating] = useState(false);

  const safePrice = price ?? 0;
  const safeOriginalPrice = originalPrice ?? 0;

  const handleAdd = useCallback(async () => {
    await addItem({ quantity: 1, deliveryType, name: title, image, price: safePrice, current_price: safePrice, slug, sku, in_stock: isInStock, stock_quantity: stockQuantity });
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
  }, [addItem, deliveryType, title, image, safePrice, slug, sku, isInStock, stockQuantity]);

  const handleIncrement = useCallback(async () => {
    await increment();
  }, [increment]);

  const handleDecrement = useCallback(async () => {
    await decrement();
  }, [decrement]);

  const priceStr = safePrice.toString();
  const integerPart = priceStr.split(".")[0];
  const decimalPart = priceStr.includes(".")
    ? "." + priceStr.split(".")[1]
    : ".00";

  return (
    <div className="flex flex-col w-full">
      <div className={cn("relative w-full aspect-square overflow-hidden rounded-xl", isDark ? "border border-white/20 bg-white/10 backdrop-blur-md" : "border border-border-light bg-white")}>
        <div className="absolute inset-0 flex z-[1] start-0 bottom-0 pointer-events-none">
          {flashSaleActive ? (
            <div className="inline-flex items-center justify-center font-bold rounded-bl-xl rounded-br-xs rounded-tl-xs rounded-tr-xl px-2 py-1 text-[10px] bg-orange-600 text-white gap-1 animate-pulse self-end">
              <span className="text-xs leading-4 font-bold truncate">Flash Sale</span>
            </div>
          ) : discountPercent && discountPercent > 0 ? (
            <div className="inline-flex items-center justify-center font-bold rounded-bl-xl rounded-br-xs rounded-tl-xs rounded-tr-xl px-2 py-1 text-[10px] bg-discount text-white gap-1 self-end">
              <span className="text-xs leading-4 font-bold truncate">{discountPercent}% OFF</span>
            </div>
          ) : null}
          {badgeText ? (
            <div className="inline-flex items-center justify-center font-bold rounded-bl-xl rounded-br-xs rounded-tl-xs rounded-tr-xl px-2 py-1 text-[10px] bg-primary text-white gap-1 self-end">
              <span className="text-xs leading-4 font-bold truncate">{badgeText}</span>
            </div>
          ) : null}
        </div>
        <Link href={`/products/${slug}`} className="block w-full h-full relative">
          <Image
            className="object-cover object-center"
            src={image}
            fill
            alt={title}
            priority={priorityProp}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          />
        </Link>

        {!isInStock && quantity === 0 ? (
          <button
            type="button"
            disabled
            className="absolute end-1 bottom-1 bg-gray-300 rounded-full w-10 h-10 text-white font-medium text-2xl flex items-center justify-center shadow-[0_2px_3px_1px_rgba(0,0,0,0.14)] z-10 cursor-not-allowed"
          >
            <Plus className="h-5 w-5" />
          </button>
        ) : quantity === 0 && hasVariants ? (
          <Link
            href={`/products/${slug}`}
            className="absolute end-1 bottom-1 bg-primary rounded-full w-10 h-10 text-white font-medium text-2xl flex items-center justify-center shadow-[0_2px_3px_1px_rgba(0,0,0,0.14)] z-10 transition-transform duration-200 hover:scale-105"
          >
            <Plus className="h-5 w-5" />
          </Link>
        ) : quantity === 0 ? (
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending}
            className={cn(
              "absolute end-1 bottom-1 bg-primary rounded-full w-10 h-10 text-white font-medium text-2xl flex items-center justify-center shadow-[0_2px_3px_1px_rgba(0,0,0,0.14)] z-10 transition-transform duration-200 hover:scale-105",
              animating && "scale-110",
              isPending && "opacity-70 cursor-not-allowed"
            )}
          >
            <Plus className="h-5 w-5" />
          </button>
        ) : (
          <div className={cn("absolute end-1 bottom-1 flex items-center gap-1 bg-primary rounded-full h-10 px-1 text-white shadow-[0_2px_3px_1px_rgba(0,0,0,0.14)] z-10 transition-all duration-300", isPending && "opacity-70 pointer-events-none")}>
            <button
              type="button"
              onClick={handleDecrement}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              aria-label="Decrease quantity"
            >
              {quantity === 1 ? (
                <Trash2 className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={isPending || !isInStock}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                !isInStock ? "cursor-not-allowed opacity-40" : "hover:bg-white/20",
              )}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <Link href={`/products/${slug}`} className="mt-2.5 px-0.5">
        <p className={cn(
          "text-sm leading-4 font-medium line-clamp-2 text-balance transition-colors cursor-pointer",
          isDark ? "text-white hover:text-white/80" : "text-black hover:text-primary",
          isRtl ? "text-right" : "text-left",
        )}>
          {title}
        </p>
      </Link>

      {tags && tags.length > 0 && (
        <div className="mt-1.5 px-0.5">
          <Swiper
            dir={isRtl ? "rtl" : "ltr"}
            modules={[Autoplay]}
            direction="vertical"
            slidesPerView={1}
            spaceBetween={4}
            loop={tags.length > 1}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            className="h-6 w-full"
          >
            {tags.map((tag) => (
              <SwiperSlide key={tag.id} className="flex items-center justify-center">
                <Link
                  href={`/tags/${tag.slug}`}
                  className={cn(
                    "inline-flex max-w-full items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium leading-4 transition-colors",
                    isDark
                      ? "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                      : "bg-surface text-text-secondary hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  <span className={isDark ? "text-white/50" : "text-primary"}>#</span>
                  <span className="truncate">{tag.name}</span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      <div className="flex items-center gap-2 mt-1.5 px-0.5 flex-wrap">
        <div className="flex items-baseline gap-px">
          <span className={cn("text-lg leading-5 font-bold md:text-xl", isDark ? "text-white" : "text-gray-900")}>
            {integerPart}
          </span>
          <div className="flex flex-col items-start">
            <span className={cn("text-sm font-bold leading-none", isDark ? "text-white" : "text-gray-900")}>{decimalPart}</span>
            <span className={cn("text-[10px] font-medium leading-none", isDark ? "text-gray-300" : "text-gray-500")}>{currency}</span>
          </div>
        </div>
        {safeOriginalPrice > safePrice && (
          <span className={cn("text-sm leading-4 font-medium line-through", isDark ? "text-gray-400" : "text-gray-400")}>
            {currency} {safeOriginalPrice.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
