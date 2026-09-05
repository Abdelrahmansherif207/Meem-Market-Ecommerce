"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { useCartActions } from "@/features/cart/hooks/useCartActions";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { Badge } from "./Badge";
import { QuantityStepper } from "./QuantityStepper";
import type { ProductTag } from "@/shared/types";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

interface ProductCardProps {
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
  inWishlist?: boolean;
  showWishlist?: boolean;
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
  stockQuantity = 10,
  priority: priorityProp,
  hasVariants = false,
  badgeText,
  isInStock = true,
  flashSaleActive = false,
  theme = "light",
  tags,
  inWishlist,
  showWishlist = true,
}: ProductCardProps) {
  const isDark = theme === "dark";
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { quantity, isPending, addItem, increment, decrement } = useCartActions(productId);
  const [animating, setAnimating] = useState(false);

  const safePrice = price ?? 0;
  const safeOriginalPrice = originalPrice ?? 0;

  const handleAdd = useCallback(async () => {
    await addItem({ quantity: 1, name: title, image, price: safePrice, current_price: safePrice, slug, sku, in_stock: isInStock, stock_quantity: stockQuantity });
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
  }, [addItem, title, image, safePrice, slug, sku, isInStock, stockQuantity]);

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
        <div className="absolute inset-0 flex start-0 bottom-0 pointer-events-none">
          {flashSaleActive ? (
            <Badge tone="flash" className="animate-pulse self-end">Flash Sale</Badge>
          ) : discountPercent && discountPercent > 0 ? (
            <Badge tone="discount" className="self-end">{discountPercent}% OFF</Badge>
          ) : null}
          {badgeText ? (
            <Badge tone="primary" className="self-end">{badgeText}</Badge>
          ) : null}
        </div>
        {showWishlist && (
          <WishlistButton
            productId={productId}
            initialInWishlist={inWishlist}
            variant="icon"
          />
        )}
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
            className="absolute end-1 bottom-1 w-9 h-9 sm:w-8 sm:h-8 z-10 flex items-center justify-center rounded-full bg-text-muted text-white font-medium border border-white shadow-elev-1 cursor-not-allowed"
            aria-label="Out of stock"
          >
            <Plus className="h-5 w-5" aria-hidden />
          </button>
        ) : quantity === 0 && hasVariants ? (
          <Link
            href={`/products/${slug}`}
            className="absolute end-1 bottom-1 w-9 h-9 sm:w-8 sm:h-8 z-10 flex items-center justify-center rounded-full bg-primary text-white border border-white shadow-elev-1 transition-all duration-200 hover:brightness-90"
            aria-label="Select options"
          >
            <Plus className="h-5 w-5" aria-hidden />
          </Link>
        ) : quantity === 0 ? (
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending}
            aria-label="Add to cart"
            className={cn(
              "absolute end-1 bottom-1 w-9 h-9 sm:w-8 sm:h-8 z-10 flex items-center justify-center rounded-full bg-primary text-white",
              "border border-white shadow-elev-1",
              "transition-all duration-200 hover:brightness-90",
              animating && "scale-110",
              isPending && "opacity-70 cursor-not-allowed",
            )}
          >
            <Plus className="h-5 w-5" aria-hidden />
          </button>
        ) : (
          <QuantityStepper
            value={quantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            decrementAsRemove
            incrementDisabled={!isInStock}
            disabled={isPending}
            variant="pill"
            size="sm"
            className="absolute end-1 bottom-1 z-10"
          />
        )}
      </div>

      <Link href={`/products/${slug}`} className="mt-2.5 px-0.5">
        <p className={cn(
          "text-sm leading-4 font-medium line-clamp-2 text-balance transition-colors cursor-pointer",
          isDark ? "text-white hover:text-white/80" : "text-text-primary hover:text-primary",
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
        <div className="flex items-baseline gap-px" dir="ltr">
          <span className={cn("text-lg leading-5 font-bold md:text-xl", isDark ? "text-white" : "text-text-primary")}>
            {integerPart}
          </span>
          <div className="flex flex-col items-start">
            <span className={cn("text-sm font-bold leading-none", isDark ? "text-white" : "text-text-primary")}>{decimalPart}</span>
            <span className={cn("text-2xs font-medium leading-none", isDark ? "text-white/60" : "text-text-muted")}>{currency}</span>
          </div>
        </div>
        {safeOriginalPrice > safePrice && (
          <span className={cn("text-sm leading-4 font-normal line-through", isDark ? "text-white/50" : "text-text-muted")}>
            {currency} {safeOriginalPrice.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
