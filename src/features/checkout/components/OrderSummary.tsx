"use client";
import { useTranslations } from "next-intl";
import { Truck, Minus, Tag, ShoppingBag } from "lucide-react";
import CouponInput from "@/features/coupons/components/CouponInput";
import CouponBadge from "@/features/coupons/components/CouponBadge";
import type { AppliedCoupon } from "@/features/coupons/types";

interface OrderSummaryProps {
  subtotal: number;
  totalQuantity: number;
  shippingFee: number;
  promotionDiscount: number;
  couponDiscount: number;
  pickupLocationName?: string;
  appliedCoupon?: AppliedCoupon | null;
  onCouponApplied?: () => void;
}

export function OrderSummary({
  subtotal,
  totalQuantity,
  shippingFee,
  promotionDiscount,
  couponDiscount,
  pickupLocationName,
  appliedCoupon,
  onCouponApplied,
}: OrderSummaryProps) {
  const t = useTranslations("checkout");
  const total = subtotal - promotionDiscount - couponDiscount + (pickupLocationName ? 0 : shippingFee);

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-4 sticky top-24">
      <div className="flex items-center gap-2">
        <div className="h-1 w-6 rounded-full bg-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
          {t("orderSummary")}
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-3.5 w-3.5 text-text-secondary shrink-0" />
            <span className="text-sm text-text-secondary">
              {t("subtotal")} ({totalQuantity} {t("items")})
            </span>
          </div>
          <span className="text-sm font-semibold tabular-nums text-text-primary">
            {subtotal.toFixed(2)} K.D
          </span>
        </div>

        {promotionDiscount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span className="text-sm text-green-600">{t("promotionDiscount")}</span>
            </div>
            <span className="text-sm font-semibold tabular-nums text-green-600">
              -{promotionDiscount.toFixed(2)} K.D
            </span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Minus className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span className="text-sm text-green-600">{t("couponDiscount")}</span>
            </div>
            <span className="text-sm font-semibold tabular-nums text-green-600">
              -{couponDiscount.toFixed(2)} K.D
            </span>
          </div>
        )}

        {pickupLocationName ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-text-secondary shrink-0" />
              <span className="text-sm text-text-secondary">{t("pickupAt")} {pickupLocationName}</span>
            </div>
          </div>
        ) : shippingFee > 0 ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-text-secondary shrink-0" />
              <span className="text-sm text-text-secondary">{t("shipping")}</span>
            </div>
            <span className="text-sm font-semibold tabular-nums text-text-primary">
              {shippingFee.toFixed(2)} K.D
            </span>
          </div>
        ) : null}
      </div>

      <CouponInput onApplied={onCouponApplied} isAuthenticated={true} />

      {appliedCoupon && (
        <CouponBadge coupon={appliedCoupon} />
      )}

      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            {t("total")}
          </span>
          <span className="text-lg font-bold tabular-nums text-text-primary">
            {Math.max(0, total).toFixed(2)} K.D
          </span>
        </div>
        <p className="text-[11px] text-text-secondary text-right mt-1">
          ({totalQuantity} {t("items")})
        </p>
      </div>
    </div>
  );
}
