"use client";

import type { AppliedCoupon } from "../types";

interface CouponBadgeProps {
  coupon: AppliedCoupon;
}

export default function CouponBadge({ coupon }: CouponBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-sm">
      <div className="flex flex-col">
        {coupon.name && (
          <span className="text-[11px] leading-tight text-green-600">{coupon.name}</span>
        )}
        <span className="font-semibold text-green-700">{coupon.code}</span>
      </div>
      {coupon.discount_amount > 0 && (
        <span className="text-green-600">
          -{coupon.discount_type === "percentage"
            ? `${coupon.discount_amount}%`
            : `${coupon.discount_amount.toFixed(2)} K.D`}
        </span>
      )}
    </div>
  );
}
