"use client";

import type { AppliedCoupon } from "../types";

interface CouponBadgeProps {
  coupon: AppliedCoupon;
}

export default function CouponBadge({ coupon }: CouponBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-success-surface px-4 py-1.5 text-sm">
      <div className="flex flex-col">
        {coupon.name && (
          <span className="text-[11px] leading-tight text-success">{coupon.name}</span>
        )}
        <span className="font-semibold text-success">{coupon.code}</span>
      </div>
      {coupon.discount_amount > 0 && (
        <span className="text-success">
          -{coupon.discount_type === "percentage"
            ? `${coupon.discount_amount}%`
            : `${coupon.discount_amount.toFixed(2)} K.D`}
        </span>
      )}
    </div>
  );
}
