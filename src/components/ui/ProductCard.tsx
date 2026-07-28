"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Trash2, Plus, Minus } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { useCartActions } from "@/features/cart/hooks/useCartActions";
import type { DeliveryType } from "@/features/cart/types";

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
}: ProductCardProps) {
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
    <div className="w-full group/card transition-all duration-300 hover:-translate-y-1">
      <div className="relative w-full aspect-square overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 group-hover/card:shadow-md max-w-[150px] max-h-[150px] box-content border border-border-light p-2">
        <div className="flex w-full z-[1] absolute start-0 bottom-0 max-w-[150px] max-h-[150px]">
          {flashSaleActive ? (
            <div className="inline-flex items-center justify-center font-bold rounded-bl-xl rounded-br-xs rounded-tl-xs rounded-tr-xl px-2 py-1 text-[10px] bg-orange-600 text-white flex max-h-[20px] relative max-w-[95%] gap-1 animate-pulse">
              <span className="text-xs leading-4 font-bold truncate">Flash Sale</span>
            </div>
          ) : discountPercent && discountPercent > 0 ? (
            <div className="inline-flex items-center justify-center font-bold rounded-bl-xl rounded-br-xs rounded-tl-xs rounded-tr-xl px-2 py-1 text-[10px] bg-discount text-white flex max-h-[20px] relative max-w-[95%] gap-1">
              <span className="text-xs leading-4 font-bold truncate"><span>{discountPercent}% OFF</span></span>
            </div>
          ) : null}
          {badgeText ? (
            <div className="inline-flex items-center justify-center font-bold rounded-bl-xl rounded-br-xs rounded-tl-xs rounded-tr-xl px-2 py-1 text-[10px] bg-primary text-white flex max-h-[20px] relative max-w-[95%] gap-1">
              <span className="text-xs leading-4 font-bold truncate"><span>{badgeText}</span></span>
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
        <Link href={`/products/${slug}`}>
            <p className={cn("text-sm leading-4 font-medium line-clamp-2 md:text-md text-black hover:text-primary transition-colors cursor-pointer mt-3", isRtl ? "text-right" : "text-left")}>
            {title}
          </p>
        </Link>
      <div className="flex items-center gap-2">
        <div className="flex mt-1 gap-px">
          <span className="text-lg leading-5 font-bold md:text-xl">
            {integerPart}
          </span>
          <div className="flex flex-col">
            <div className="text-sm font-bold leading-none">{decimalPart}</div>
            <div className="text-[10px] font-medium leading-none">
              {currency}
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm leading-4 font-medium text-gray-500 self-center line-through">
            {currency} {safeOriginalPrice.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
