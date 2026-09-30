"use client";
import { useTranslations } from "next-intl";
import { Truck, Minus, Tag, ShoppingBag } from "lucide-react";
import CouponInput from "@/features/coupons/components/CouponInput";
import CouponBadge from "@/features/coupons/components/CouponBadge";
import { Price } from "@/components/ui/Price";
import type { AppliedCoupon } from "@/features/coupons/types";
import type { ShippingQuote } from "../utils/shippingFee";

interface OrderSummaryProps {
  subtotal: number;
  totalQuantity: number;
  shipping?: ShippingQuote | null;
  promotionDiscount: number;
  couponDiscount: number;
  pickupLocationName?: string;
  appliedCoupon?: AppliedCoupon | null;
  onCouponApplied?: () => void;
}

export function OrderSummary({
  subtotal,
  totalQuantity,
  shipping,
  promotionDiscount,
  couponDiscount,
  pickupLocationName,
  appliedCoupon,
  onCouponApplied,
}: OrderSummaryProps) {
  const t = useTranslations("checkout");
  const shippingFee = pickupLocationName ? 0 : shipping?.fee ?? 0;
  const total = subtotal - promotionDiscount - couponDiscount + shippingFee;
  const estimatedDays = pickupLocationName ? null : shipping?.estimatedDays ?? null;

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-4">
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
          <Price amount={subtotal} className="text-sm font-semibold text-text-primary" />
        </div>

        {promotionDiscount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-success shrink-0" />
              <span className="text-sm text-success">{t("promotionDiscount")}</span>
            </div>
            <Price amount={promotionDiscount} prefix="-" className="text-sm font-semibold text-success" />
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Minus className="h-3.5 w-3.5 text-success shrink-0" />
              <span className="text-sm text-success">{t("couponDiscount")}</span>
            </div>
            <Price amount={couponDiscount} prefix="-" className="text-sm font-semibold text-success" />
          </div>
        )}

        {pickupLocationName ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-text-secondary shrink-0" />
              <span className="text-sm text-text-secondary">{t("pickupAt")} {pickupLocationName}</span>
            </div>
          </div>
        ) : shipping && (shipping.free || shipping.fee > 0) ? (
          shipping.free ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                <span className="text-sm text-text-secondary">
                  {t("shipping")}
                  {estimatedDays !== null && (
                    <span className="ms-1 text-xs">{t("shippingDays", { days: estimatedDays })}</span>
                  )}
                </span>
              </div>
              <span className="text-sm font-semibold text-success">{t("freeShipping")}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                <span className="text-sm text-text-secondary">
                  {t("shippingEstimate")}
                  {estimatedDays !== null && (
                    <span className="ms-1 text-xs">{t("shippingDays", { days: estimatedDays })}</span>
                  )}
                </span>
              </div>
              <Price amount={shipping.fee} className="text-sm font-semibold text-text-primary" />
            </div>
          )
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
          <Price amount={Math.max(0, total)} className="text-lg font-bold text-text-primary" />
        </div>
        <p className="text-[11px] text-text-secondary text-right mt-1">
          ({totalQuantity} {t("items")})
        </p>
      </div>
    </div>
  );
}
