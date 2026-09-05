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

  const priceStr = displayPrice.toFixed(2);
  const intPart = priceStr.split(".")[0];
  const decPart = "." + priceStr.split(".")[1];

  const origPriceStr = originalPrice.toFixed(2);
  const origInt = origPriceStr.split(".")[0];
  const origDec = "." + origPriceStr.split(".")[1];

  const discountPercent = hasDiscount
    ? Math.round((1 - displayPrice / originalPrice) * 100)
    : 0;

  return (
    <div className="flex gap-3 border border-border p-3 rounded-lg">
      <Link href={item.slug ? `/products/${item.slug}` : "#"} className="block shrink-0">
        <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-white">
          <Image src={item.image} alt={item.name} width={96} height={96} className="object-cover" />
        </div>
      </Link>

      <div className="flex flex-1 min-w-0 gap-2">
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <Link href={item.slug ? `/products/${item.slug}` : "#"}>
              <h4 className="truncate text-sm font-semibold hover:text-primary transition-colors">{item.name}</h4>
            </Link>
            {item.sku && (
              <p className="mt-0.5 text-[11px] text-text-secondary">SKU: {item.sku}</p>
            )}
            <p className={cn("text-[11px]", item.in_stock ? "text-success" : "text-error")}>
              {item.in_stock ? t("inStock") : t("outOfStock")}
              {item.in_stock && item.stock_quantity != null && ` (${item.stock_quantity})`}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {hasDiscount && (
              <div className="flex items-center gap-1" dir="ltr">
                <span className="text-xs leading-4 font-medium text-text-muted line-through">
                  {origInt}
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] leading-3 font-medium text-text-muted line-through">{origDec}</span>
                  <span className="text-[8px] leading-3 font-medium text-text-muted line-through">{currencyLabel()}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1" dir="ltr">
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
        </div>

        <div className="flex flex-col items-end justify-center gap-2 shrink-0">
          {isPending ? (
            <div className="flex h-11 w-[calc(4*28px+2px)] items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex items-center gap-0.5 rounded-lg border border-border">
              <button
                onClick={() => onRemove(item.product_id)}
                disabled={isPending}
                className="flex h-11 w-11 items-center justify-center text-text-secondary hover:text-error transition-colors disabled:opacity-30"
                aria-label={t("removeItem")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="h-5 w-px bg-border" />
              <button
                onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                disabled={isPending || item.quantity <= 1}
                className="flex h-11 w-11 items-center justify-center text-text-secondary hover:text-primary disabled:opacity-30 transition-colors"
                aria-label={t("decreaseQuantity")}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-11 w-9 items-center justify-center text-sm font-medium tabular-nums">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                disabled={isPending || (item.stock_quantity != null && item.quantity >= item.stock_quantity)}
                className="flex h-11 w-11 items-center justify-center text-text-secondary hover:text-primary disabled:opacity-30 transition-colors"
                aria-label={t("increaseQuantity")}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
          <span className="text-xs font-semibold tabular-nums text-text-secondary" dir="ltr">
            {lineTotal.toFixed(2)} {currencyLabel()}
          </span>
        </div>
      </div>
    </div>
  );
}
