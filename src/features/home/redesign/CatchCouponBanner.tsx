"use client";

import Image from "next/image";
import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { Coupon } from "@/features/coupons/types";

interface CatchCouponBannerProps {
  coupon: Coupon;
  /** "full" spans the grid width; "half" is one of a 2-column row. */
  variant?: "full" | "half";
  className?: string;
}

/**
 * Full-bleed coupon banner tile (screen campaign-grid style): the coupon
 * image covers the tile, clicking copies the code when the API provides
 * one (many coupons ship `code: null` — click is a no-op then).
 */
export default function CatchCouponBanner({
  coupon,
  variant = "half",
  className,
}: CatchCouponBannerProps) {
  const [copied, setCopied] = useState(false);
  const imageSrc = coupon.image?.desktop || coupon.image?.mobile;

  const handleCopy = async () => {
    if (!coupon.code) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={coupon.name}
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl",
        coupon.code ? "cursor-pointer" : "cursor-default",
        variant === "full" ? "h-40 sm:h-52 lg:h-56" : "h-36 sm:h-44 lg:h-52",
        className,
      )}
      style={
        imageSrc
          ? undefined
          : { backgroundColor: coupon.borderColor || "var(--color-line)" }
      }
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={coupon.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-bold text-white">
          {coupon.name}
        </span>
      )}

      {copied && (
        <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary">
            <Check className="h-4 w-4" />
            {coupon.code}
          </span>
        </span>
      )}
    </button>
  );
}
