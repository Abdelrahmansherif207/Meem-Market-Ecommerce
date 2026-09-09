"use client";

import { Truck, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Price } from "@/components/ui/Price";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import CouponInput from "@/features/coupons/components/CouponInput";
import CouponBadge from "@/features/coupons/components/CouponBadge";
import type { AppliedCoupon } from "@/features/coupons/types";

interface CartSummaryProps {
  subtotal: number;
  quantity: number;
  appliedCoupon?: AppliedCoupon | null;
  couponDiscount?: number;
  onCouponApplied?: () => void;
}

export function CartSummary({
  subtotal,
  quantity,
  appliedCoupon,
  couponDiscount = 0,
  onCouponApplied,
}: CartSummaryProps) {
  const t = useTranslations("cartPage");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const totalQty = quantity;
  const total = subtotal - couponDiscount;

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-1 w-6 rounded-full bg-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">{t("orderSummary")}</h3>
      </div>

      <div className="space-y-3">
        {totalQty > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-text-secondary shrink-0" />
              <span className="text-sm text-text-secondary">
                {t("scheduledTitle")} <span className="text-xs text-text-secondary">({totalQty} {t("cartItems", { count: totalQty })})</span>
              </span>
            </div>
            <Price amount={subtotal} className="text-sm font-semibold text-text-primary" />
          </div>
        )}
      </div>

      <CouponInput onApplied={onCouponApplied} isAuthenticated={isAuthenticated} />

      {appliedCoupon && (
        <CouponBadge coupon={appliedCoupon} />
      )}

      {couponDiscount > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Minus className="h-3.5 w-3.5 text-success shrink-0" />
            <span className="text-sm text-success">{t("discount")}</span>
          </div>
          <Price amount={couponDiscount} prefix="-" className="text-sm font-semibold text-success" />
        </div>
      )}

      <div className="border-t border-border pt-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">{t("total")}</span>
          <Price amount={Math.max(0, total)} className="text-lg font-bold text-text-primary" />
        </div>
        <p className="text-[11px] text-text-secondary text-end">
          ({totalQty} {t("cartItems", { count: totalQty })})
        </p>
      </div>
    </div>
  );
}
