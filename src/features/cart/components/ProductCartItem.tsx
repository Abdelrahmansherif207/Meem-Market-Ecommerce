"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { Price } from "@/components/ui/Price";
import type { CartLineIdentity, HydratedCartItem } from "../types";
import { getDisplayPrice, getOriginalPrice } from "@/features/products";
import type { PriceInfo } from "@/features/products/types";

interface ProductCartItemProps {
  item: HydratedCartItem;
  /** Disables all controls and shows a loading spinner while an API call is in-flight. */
  isPending?: boolean;
  onUpdateQuantity: (productId: number, quantity: number, line: CartLineIdentity) => void;
  onRemove: (productId: number, line: CartLineIdentity) => void;
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
  return (
    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1">
      <Price amount={value} className="shrink-0 text-base font-bold sm:text-lg" />
      {hasDiscount && (
        <Price
          amount={originalValue}
          className="shrink-0 text-xs tabular-nums text-text-muted line-through sm:text-sm"
        />
      )}
      {hasDiscount && (
        <span className="shrink-0 rounded bg-error-surface px-1 py-0.5 text-[10px] font-bold whitespace-nowrap text-discount">
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

  const line: CartLineIdentity = {
    productVariantId: item.product_variant_id ?? null,
    deliveryType: item.deliveryType ?? "scheduled",
  };

  const btnClass =
    "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center text-text-secondary transition-colors disabled:opacity-30";

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
          {item.variant_label && (
            <p className="line-clamp-1 text-[11px] text-text-secondary">{item.variant_label}</p>
          )}
          {item.sku && (
            <p className="text-[11px] text-text-secondary">SKU: {item.sku}</p>
          )}
          <p className={cn("text-[11px]", item.in_stock ? "text-success" : "text-error")}>
            {item.in_stock ? t("inStock") : t("outOfStock")}
            {item.in_stock && item.stock_quantity != null && ` (${item.stock_quantity})`}
          </p>
          <div className="mt-auto min-w-0 pt-1">
            <PriceBlock
              value={displayPrice}
              originalValue={originalPrice}
              hasDiscount={hasDiscount}
              discountPercent={discountPercent}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex min-w-0 items-center justify-between gap-2 border-t border-border-subtle pt-3">
        {isPending ? (
          <div className="flex h-8 sm:h-10 items-center px-1">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border">
            <button
              onClick={() => onRemove(item.product_id, line)}
              disabled={isPending}
              className={cn(btnClass, "hover:text-error")}
              aria-label={t("removeItem")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="h-5 w-px bg-border" />
            <button
              onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1, line)}
              disabled={isPending || item.quantity <= 1}
              className={cn(btnClass, "hover:text-primary")}
              aria-label={t("decreaseQuantity")}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex h-8 w-7 sm:h-10 sm:w-8 items-center justify-center text-sm font-medium tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1, line)}
              disabled={isPending || (item.stock_quantity != null && item.quantity >= item.stock_quantity)}
              className={cn(btnClass, "hover:text-primary")}
              aria-label={t("increaseQuantity")}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
        <Price
          amount={lineTotal}
          className="shrink-0 text-end text-sm font-bold text-text-primary"
        />
      </div>
    </div>
  );
}
