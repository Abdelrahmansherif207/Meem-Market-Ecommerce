"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart, Loader2, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import type { WishlistItem } from "../types";
import { getWishlistSalePrice, getWishlistVariantLabel } from "../utils";

interface WishlistItemCardProps {
  item: WishlistItem;
  isPending?: boolean;
  onRemove: () => void;
}

export function WishlistItemCard({
  item,
  isPending = false,
  onRemove,
}: WishlistItemCardProps) {
  const t = useTranslations("wishlist");
  const product = item.product;
  const variantLabel = getWishlistVariantLabel(item);
  const sale = getWishlistSalePrice(item);
  const currency = "K.D";

  const priceStr = (sale?.price ?? product.current_price ?? product.price ?? 0).toString();
  const integerPart = priceStr.split(".")[0];
  const decimalPart = priceStr.includes(".") ? "." + priceStr.split(".")[1] : ".00";

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-white p-3 transition-shadow hover:shadow-sm sm:gap-4">
      <Link
        href={`/products/${product.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface sm:h-24 sm:w-24"
      >
        <Image
          src={product.image?.thumbnail ?? ""}
          alt={product.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold text-text-primary transition-colors hover:text-primary"
        >
          {product.name}
        </Link>

        {variantLabel && (
          <p className="mt-1 line-clamp-1 text-xs text-text-secondary">
            {variantLabel}
          </p>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="flex items-baseline gap-px">
            <span className="text-base font-bold leading-5 text-gray-900">
              {integerPart}
            </span>
            <span className="text-xs font-bold leading-none text-gray-900">
              {decimalPart}
            </span>
            <span className="ms-0.5 text-[10px] font-medium leading-none text-gray-500">
              {currency}
            </span>
          </span>
          {sale && (
            <span className="text-xs leading-4 font-medium text-gray-400 line-through">
              {sale.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <Heart
          className="size-4 fill-red-500 text-red-500"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={isPending}
          aria-label={t("remove")}
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
