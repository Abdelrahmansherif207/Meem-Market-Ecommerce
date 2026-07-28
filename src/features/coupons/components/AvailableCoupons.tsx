"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Copy, Check } from "lucide-react";
import { couponService } from "../services/couponService";
import { CouponCardSkeleton } from "./skeletons/CouponSkeleton";
import type { Coupon } from "../types";

interface AvailableCouponsProps {
  onSelectCoupon: (coupon: Coupon) => void;
}

export default function AvailableCoupons({ onSelectCoupon }: AvailableCouponsProps) {
  const locale = useLocale();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    couponService.getCoupons(locale).then((data) => {
      if (cancelled) return;
      setCoupons(data);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [locale]);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <CouponCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (coupons.length === 0) return null;

  const handleCopy = async (coupon: Coupon) => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopiedId(coupon.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* clipboard not available */ }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-text-secondary">Available Coupons</h4>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="flex flex-col flex-shrink-0 w-36 rounded-xl overflow-hidden border-2 cursor-pointer hover:shadow-md transition-shadow"
            style={{ borderColor: coupon.borderColor || "#e5e7eb" }}
          >
            <button
              type="button"
              className="relative w-full aspect-[3/4] bg-surface overflow-hidden"
              onClick={() => onSelectCoupon(coupon)}
              title={`Use code: ${coupon.code}`}
            >
              <img
                src={coupon.image.desktop || coupon.image.mobile}
                alt={coupon.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
            <div className="p-2 space-y-1">
              <p className="text-xs font-medium text-text-primary truncate">{coupon.name}</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleCopy(coupon); }}
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors"
              >
                {copiedId === coupon.id ? (
                  <><Check className="h-3 w-3" /> Copied</>
                ) : (
                  <><Copy className="h-3 w-3" /> Copy code</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
