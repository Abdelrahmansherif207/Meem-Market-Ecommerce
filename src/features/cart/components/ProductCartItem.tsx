"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { currencyLabel } from "@/shared/utils/formatMoney";
import type { HydratedCartItem } from "../types";
import { getDisplayPrice, getOriginalPrice } from "@/features/products";
import type { PriceInfo } from "@/features/products/types";

interface ProductCartItemProps {
  item: HydratedCartItem;
  /** Disables all controls and shows a loading spinner while an API call is in-flight. */
  isPending?: boolean;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

function toPriceInfo(item: HydratedCartItem): PriceInfo {
  return {
    has_flash_sale: false,
    price_after_flash_sale: null,
    has_discount: false,
    price_after_discount: null,
    current_price: item.current_price,
    price: item.price,
  };
}

function PriceBlock({
  value,
  originalValue,
  hasDiscount,
  discountPercent,
}: {
  value: number;
  originalValue: number;
  hasDiscount: boolean;
  discountPercent: number;
}) {
  const priceStr = value.toFixed(2);
  const intPart = priceStr.split(".")[0];
  const decPart = "." + priceStr.split(".")[1];

  const origPriceStr = originalValue.toFixed(2);
  const origInt = origPriceStr.split(".")[0];
  const origDec = "." + origPriceStr.split(".")[1];

  return (
    <div className="flex flex-wrap items-center gap-2" dir="ltr">
      {hasDiscount && (
        <div className="flex items-center gap-1">
          <span className="text-xs leading-4 font-medium text-text-muted line-through">
            {origInt}
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] leading-3 font-medium text-text-muted line-through">{origDec}</span>
            <span className="text-[8px] leading-3 font-medium text-text-muted line-through">{currencyLabel()}</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-1">
        <span className="text-base leading-5 font-bold">{intPart}</span>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-3">{decPart}</span>
          <span className="text-[10px] font-medium leading-3">{currencyLabel()}</span>
        </div>
      </div>
      {hasDiscount && (
        <span className="text-[10px] font-bold text-discount bg-error-surface px-1 py-0.5 rounded">
          -{discountPercent}%
        </span>
      )}
    </div>
  );
}

export function ProductCartItem({
  item,
  isPending = false,
  onUpdateQuantity,
  onRemove,
}: ProductCartItemProps) {
  const t = useTranslations("cartPage");
  const priceInfo = toPriceInfo(item);
  const displayPrice = getDisplayPrice(priceInfo);
  const originalPrice = getOriginalPrice(priceInfo);
  const hasDiscount = displayPrice < originalPrice;
  const lineTotal = displayPrice * item.quantity;

  const discountPercent = hasDiscount
    ? Math.round((1 - displayPrice / originalPrice) * 100)
    : 0;

  const btnClass =
    "flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center text-text-secondary transition-colors disabled:opacity-30";

  return (
    <div className="rounded-lg border border-border p-3 sm:p-4">
      <div className="flex gap-3">
        <Link href={item.slug ? `/products/${item.slug}` : "#"} className="block shrink-0">
          <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-white sm:h-24 sm:w-24">
            <Image
              src={item.image}
              alt={item.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Link href={item.slug ? `/products/${item.slug}` : "#"}>
            <h4 className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary transition-colors">
              {item.name}
            </h4>
          </Link>
          {item.sku && (
            <p className="text-[11px] text-text-secondary">SKU: {item.sku}</p>
          )}
          <p className={cn("text-[11px]", item.in_stock ? "text-success" : "text-error")}>
            {item.in_stock ? t("inStock") : t("outOfStock")}
            {item.in_stock && item.stock_quantity != null && ` (${item.stock_quantity})`}
          </p>
          <div className="mt-auto pt-1">
            <PriceBlock
              value={displayPrice}
              originalValue={originalPrice}
              hasDiscount={hasDiscount}
              discountPercent={discountPercent}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
        {isPending ? (
          <div className="flex h-9 sm:h-11 items-center px-1">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex items-center gap-0.5 rounded-lg border border-border">
            <button
              onClick={() => onRemove(item.product_id)}
              disabled={isPending}
              className={cn(btnClass, "hover:text-error")}
              aria-label={t("removeItem")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="h-5 w-px bg-border" />
            <button
              onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
              disabled={isPending || item.quantity <= 1}
              className={cn(btnClass, "hover:text-primary")}
              aria-label={t("decreaseQuantity")}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex h-9 w-8 sm:h-11 sm:w-9 items-center justify-center text-sm font-medium tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
              disabled={isPending || (item.stock_quantity != null && item.quantity >= item.stock_quantity)}
              className={cn(btnClass, "hover:text-primary")}
              aria-label={t("increaseQuantity")}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
        <span className="text-sm font-bold tabular-nums text-text-primary" dir="ltr">
          {lineTotal.toFixed(2)} {currencyLabel()}
        </span>
      </div>
    </div>
  );
}
