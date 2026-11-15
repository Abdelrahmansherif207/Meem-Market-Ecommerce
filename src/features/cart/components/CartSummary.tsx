"use client";

import { Car, Zap, Minus, Percent } from "lucide-react";
import { useTranslations } from "next-intl";
import { Price } from "@/components/ui/Price";
import { useAuthStore } from "@/features/auth";
import CouponInput from "@/features/coupons/components/CouponInput";
import type { AppliedCoupon } from "@/features/coupons/types";
import { calcTaxAmount } from "../utils";

interface CartSummaryProps {
  scheduledSubtotal: number;
  scheduledQty: number;
  fastSubtotal: number;
  fastQty: number;
  appliedCoupon?: AppliedCoupon | null;
  couponDiscount?: number;
  /** Site settings: `order_tax_enabled` / `order_tax_rate`. */
  taxEnabled?: boolean;
  taxRate?: number | null;
  onCouponApplied?: () => void;
}

/**
 * Cart totals split by order group. Coupons belong to the scheduled order
 * only — NOW checkout never claims a coupon discount.
 */
export function CartSummary({
  scheduledSubtotal,
  scheduledQty,
  fastSubtotal,
  fastQty,
  appliedCoupon,
  couponDiscount = 0,
  taxEnabled = false,
  taxRate = null,
  onCouponApplied,
}: CartSummaryProps) {
  const t = useTranslations("cartPage");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const totalQty = scheduledQty + fastQty;
  const scheduledAfterCoupon = Math.max(0, scheduledSubtotal - couponDiscount);
  const taxableSubtotal = scheduledAfterCoupon + fastSubtotal;
  const taxAmount = calcTaxAmount(taxableSubtotal, taxEnabled, taxRate);
  const total = taxableSubtotal + taxAmount;

  return (
    <div className="space-y-5 rounded-2xl border-2 border-border bg-white p-5">
      <div className="flex items-center gap-2">
        <div className="h-1 w-6 rounded-full bg-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
          {t("orderSummary")}
        </h3>
      </div>

      <div className="space-y-3">
        {scheduledQty > 0 && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Car className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate text-sm text-text-secondary">
                {t("scheduledTitle")}
                <span className="ms-1 text-xs">
                  ({t("cartItems", { count: scheduledQty })})
                </span>
              </span>
            </div>
            <Price
              amount={scheduledSubtotal}
              className="shrink-0 text-sm font-medium text-text-primary"
            />
          </div>
        )}

        {fastQty > 0 && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Zap className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="truncate text-sm text-text-secondary">
                {t("fastTitle")}
                <span className="ms-1 text-xs">
                  ({t("cartItems", { count: fastQty })})
                </span>
              </span>
            </div>
            <Price
              amount={fastSubtotal}
              className="shrink-0 text-sm font-medium text-text-primary"
            />
          </div>
        )}
      </div>

      {(scheduledQty > 0 || couponDiscount > 0) && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-[11px] text-text-secondary">
            {t("couponScheduledOnly")}
          </p>
          <CouponInput onApplied={onCouponApplied} isAuthenticated={isAuthenticated} />
        </div>
      )}

      {couponDiscount > 0 && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Minus className="h-3.5 w-3.5 shrink-0 text-success" />
            <span className="text-sm text-success">{t("discount")}</span>
            {appliedCoupon?.code && (
              <span
                dir="ltr"
                className="truncate rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success"
              >
                {appliedCoupon.code}
              </span>
            )}
          </div>
          <Price
            amount={couponDiscount}
            prefix="-"
            className="shrink-0 text-sm font-medium text-success"
          />
        </div>
      )}

      {taxAmount > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
            <span className="text-sm text-text-secondary">
              {taxRate && taxRate > 0
                ? t("taxWithRate", { rate: taxRate })
                : t("tax")}
            </span>
          </div>
          <Price
            amount={taxAmount}
            className="text-sm font-medium text-text-primary"
          />
        </div>
      )}

      <div className="space-y-1 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            {t("total")}
          </span>
          <Price
            amount={Math.max(0, total)}
            className="text-lg font-medium text-text-primary"
          />
        </div>
        <p className="text-end text-[11px] text-text-secondary">
          {t("cartItems", { count: totalQty })}
        </p>
      </div>
    </div>
  );
}
