"use client";

import { ShoppingBag, Truck, ChevronRight, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import CouponInput from "@/features/coupons/components/CouponInput";
import CouponBadge from "@/features/coupons/components/CouponBadge";
import type { AppliedCoupon } from "@/features/coupons/types";

interface CartSummaryProps {
  subtotal: number;
  totalQuantity: number;
  checkoutEnabled: boolean;
  minimumOrderAmount: number;
  appliedCoupon?: AppliedCoupon | null;
  couponDiscount?: number;
  onCouponApplied?: () => void;
}

export function CartSummary({
  subtotal,
  totalQuantity,
  checkoutEnabled,
  minimumOrderAmount,
  appliedCoupon,
  couponDiscount = 0,
  onCouponApplied,
}: CartSummaryProps) {
  const t = useTranslations("cartPage");
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const total = subtotal - couponDiscount;

  const lines = [
    { Icon: Truck, label: t("scheduledTitle"), qty: totalQuantity, sub: subtotal },
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
          ({totalQuantity} {t("cartItems", { count: totalQuantity })})
        </p>
      </div>

      <button
        disabled={!checkoutEnabled}
        onClick={() => router.push(isAuthenticated ? "/payment" : "/auth?redirect=/payment")}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ShoppingBag className="h-4 w-4" />
        {t("checkout")}
        <ChevronRight className="h-4 w-4" />
      </button>

      {!checkoutEnabled && (
        <p className="text-center text-[11px] text-text-secondary">
          {t("minimumOrder", { amount: minimumOrderAmount })}
        </p>
      )}
    </div>
  );
}
