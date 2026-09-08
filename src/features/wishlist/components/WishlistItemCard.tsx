"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart, Loader2, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import { Price } from "@/components/ui/Price";
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
  const price = sale?.price ?? product.current_price ?? product.price ?? 0;

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

        <div className="mt-auto flex items-center gap-2 pt-2 flex-wrap">
          <Price amount={price} className="text-base font-bold text-text-primary" />
          {sale && (
            <Price
              amount={sale.originalPrice}
              className="text-xs font-medium text-text-muted line-through"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <Heart
          className="size-4 fill-discount text-error"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={isPending}
          aria-label={t("remove")}
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-red-50 hover:text-error disabled:cursor-not-allowed disabled:opacity-50",
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
