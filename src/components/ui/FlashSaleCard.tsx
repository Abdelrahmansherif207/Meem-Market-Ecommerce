"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Heart, Star } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface FlashSaleCardItem {
  id: number | string;
  name: string;
  slug?: string;
  image: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  hasVariants?: boolean;
  colorVariants?: string[];
}

interface FlashSaleCardProps {
  item: FlashSaleCardItem;
  priority?: boolean;
}

export default function FlashSaleCard({ item, priority }: FlashSaleCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const discountPercent =
    item.price && item.originalPrice && item.originalPrice > item.price
      ? Math.round((1 - item.price / item.originalPrice) * 100)
      : 0;

  const formatPrice = (val: number) =>
    val.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 });

  return (
    <div className="group/card flex flex-col w-full bg-white rounded-lg border border-border-subtle shadow-elev-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-elev-2 overflow-hidden">
      {/* Image Area */}
      <div className="relative w-full aspect-square bg-surface overflow-hidden">
        <Link href={`/products/${item.slug ?? item.id}`} className="block w-full h-full">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain p-3 transition-transform duration-500 group-hover/card:scale-105"
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, 16vw"
          />
        </Link>

        {/* Best Seller Badge (top-left) */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-success text-white text-2xs font-bold px-2 py-0.5 rounded-md leading-normal">
            Best Seller
          </span>
        )}

        {/* Wishlist Toggle (top-right) */}
        <button
          onClick={() => setWishlisted((p) => !p)}
          className="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm shadow-elev-1 transition-colors hover:bg-white"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn("size-3.5 transition-colors", wishlisted ? "fill-discount text-discount" : "text-text-secondary")}
          />
        </button>

        {/* Color Variant Indicators */}
        {item.colorVariants && item.colorVariants.length > 0 && (
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-0.5">
            {item.colorVariants.slice(0, 3).map((color, i) => (
              <span
                key={i}
                className="block w-3 h-3 rounded-full border border-white shadow-elev-1"
                style={{ backgroundColor: color }}
              />
            ))}
            {item.colorVariants.length > 3 && (
              <span className="text-2xs font-medium text-text-muted ml-0.5">
                +{item.colorVariants.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="flex flex-col gap-1.5 p-2.5">
        {/* Product Name */}
        <Link href={`/products/${item.slug ?? item.id}`}>
          <p className="text-sm font-medium text-text-primary leading-tight line-clamp-2 hover:text-primary transition-colors">
            {item.name}
          </p>
        </Link>

        {/* Rating */}
        {item.rating != null && (
          <div className="flex items-center gap-1">
            <Star className="size-3 fill-success text-success" />
            <span className="text-xs font-semibold text-text-primary">{item.rating.toFixed(1)}</span>
            {item.reviewCount != null && (
              <span className="text-xs text-text-muted">({item.reviewCount})</span>
            )}
          </div>
        )}

        {/* Pricing */}
        {item.price != null && (
          <div className="flex items-baseline gap-1.5 flex-wrap" dir="ltr">
            <span className="text-sm font-bold text-text-primary">
              {formatPrice(item.price)} EGP
            </span>
            {item.originalPrice != null && item.originalPrice > item.price && (
              <>
                <span className="text-xs text-text-muted line-through">
                  {formatPrice(item.originalPrice)}
                </span>
                <span className="text-xs font-semibold text-success">
                  {discountPercent}%
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
