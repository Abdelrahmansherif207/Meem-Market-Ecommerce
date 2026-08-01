"use client";

import { Truck, Zap, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import CouponInput from "@/features/coupons/components/CouponInput";
import CouponBadge from "@/features/coupons/components/CouponBadge";
import type { AppliedCoupon } from "@/features/coupons/types";

interface CartSummaryProps {
  scheduledSubtotal: number;
  scheduledQty: number;
  fastSubtotal: number;
  fastQty: number;
  appliedCoupon?: AppliedCoupon | null;
  couponDiscount?: number;
  onCouponApplied?: () => void;
}

export function CartSummary({
  scheduledSubtotal,
  scheduledQty,
  fastSubtotal,
  fastQty,
  appliedCoupon,
  couponDiscount = 0,
  onCouponApplied,
}: CartSummaryProps) {
  const t = useTranslations("cartPage");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const totalQty = scheduledQty + fastQty;
  const total = scheduledSubtotal + fastSubtotal - couponDiscount;

  const lines = [
    { Icon: Truck, label: t("scheduledTitle"), qty: scheduledQty, sub: scheduledSubtotal },
    { Icon: Zap, label: t("fastTitle"), qty: fastQty, sub: fastSubtotal },
  ];

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-1 w-6 rounded-full bg-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Order Summary</h3>
      </div>

      <div className="space-y-3">
        {lines.map((l) =>
          l.qty > 0 ? (
            <div key={l.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <l.Icon className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                <span className="text-sm text-text-secondary">
                  {l.label} <span className="text-xs text-text-secondary">({l.qty} {t("cartItems", { count: l.qty })})</span>
                </span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-text-primary">{l.sub.toFixed(2)} K.D</span>
            </div>
          ) : null,
        )}
      </div>

      <CouponInput onApplied={onCouponApplied} isAuthenticated={isAuthenticated} />

      {appliedCoupon && (
        <CouponBadge coupon={appliedCoupon} />
      )}

      {couponDiscount > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Minus className="h-3.5 w-3.5 text-green-600 shrink-0" />
            <span className="text-sm text-green-600">Discount</span>
          </div>
          <span className="text-sm font-semibold tabular-nums text-green-600">
            -{couponDiscount.toFixed(2)} K.D
          </span>
        </div>
      )}

      <div className="border-t border-border pt-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Total</span>
          <span className="text-lg font-bold tabular-nums text-text-primary">{Math.max(0, total).toFixed(2)} K.D</span>
        </div>
        <p className="text-[11px] text-text-secondary text-right">
          ({totalQty} {t("cartItems", { count: totalQty })})
        </p>
      </div>
    </div>
  );
}
