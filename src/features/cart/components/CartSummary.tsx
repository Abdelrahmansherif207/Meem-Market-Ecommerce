"use client";

import { Truck, Minus, Percent } from "lucide-react";
import { useTranslations } from "next-intl";
import { Price } from "@/components/ui/Price";
import { useAuthStore } from "@/features/auth";
import CouponInput from "@/features/coupons/components/CouponInput";
import type { AppliedCoupon } from "@/features/coupons/types";
import { calcTaxAmount } from "../utils";

interface CartSummaryProps {
  subtotal: number;
  quantity: number;
  appliedCoupon?: AppliedCoupon | null;
  couponDiscount?: number;
  /** Site settings: `order_tax_enabled` / `order_tax_rate`. */
  taxEnabled?: boolean;
  taxRate?: number | null;
  onCouponApplied?: () => void;
}

export function CartSummary({
  subtotal,
  quantity,
  appliedCoupon,
  couponDiscount = 0,
  taxEnabled = false,
  taxRate = null,
  onCouponApplied,
}: CartSummaryProps) {
  const t = useTranslations("cartPage");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const totalQty = quantity;
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const taxAmount = calcTaxAmount(discountedSubtotal, taxEnabled, taxRate);
  const total = discountedSubtotal + taxAmount;

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

      {couponDiscount > 0 && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Minus className="h-3.5 w-3.5 shrink-0 text-success" />
            <span className="text-sm text-success">{t("discount")}</span>
            {appliedCoupon?.code && (
              <span
                dir="ltr"
                className="truncate rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success"
              >
                {appliedCoupon.code}
              </span>
            )}
          </div>
          <Price amount={couponDiscount} prefix="-" className="shrink-0 text-sm font-semibold text-success" />
        </div>
      )}

      {taxAmount > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="h-3.5 w-3.5 text-text-secondary shrink-0" />
            <span className="text-sm text-text-secondary">
              {taxRate && taxRate > 0
                ? t("taxWithRate", { rate: taxRate })
                : t("tax")}
            </span>
          </div>
          <Price amount={taxAmount} className="text-sm font-semibold text-text-primary" />
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
