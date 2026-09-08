"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Truck, Zap, Gift, Star, ShoppingCart, Car, ShoppingBag, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { useDisplayCurrency } from "@/features/currencies";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { DeliveryType, HydratedCartItem } from "../types";
import { ProductCartItem } from "./ProductCartItem";
import { calcSubtotal, isFreeShipping, canCheckout } from "../utils";

interface CartSectionProps {
  deliveryType: DeliveryType;
  items: HydratedCartItem[];
  pendingItemIds?: Set<number>;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  minimumOrderAmount: number;
}

export function CartSection({
  deliveryType,
  items,
  pendingItemIds,
  onUpdateQuantity,
  onRemove,
  minimumOrderAmount,
}: CartSectionProps) {
  const t = useTranslations("cartPage");
  const locale = useLocale();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { code: currencyCode, decimalPlaces } = useDisplayCurrency();
  const moneyOpts = { symbol: currencyCode, decimalPlaces };

  const subtotal = calcSubtotal(
    items.map((i) => ({ price: i.current_price, quantity: i.quantity })),
  );

  const checkoutEnabled = canCheckout(subtotal, minimumOrderAmount);

  const isFast = deliveryType === "fast";
  const badgeColor = isFast ? "bg-accent text-white" : "bg-primary text-white";
  const DeliveryIcon = isFast ? Zap : Car;
  const title = isFast ? t("fastTitle") : t("scheduledTitle");
  const eta = isFast ? t("fastEta") : t("scheduledEta");

  if (items.length === 0) return null;

  const checkoutHref = isAuthenticated
    ? (isFast ? "/payment?type=fast" : "/payment")
    : `/auth?redirect=${isFast ? "/payment?type=fast" : "/payment"}`;

  // Free shipping progress (scheduled-only)
  const freeShippingThreshold = 300;
  const freeShippingEligible = isFreeShipping(subtotal, freeShippingThreshold);
  const freeShipPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const freeShipRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const fillGradient = "from-primary to-primary-dark";
  const activeColor = "border-primary bg-primary";
  const activeText = "text-primary";
  const milestonePos = (minimumOrderAmount / freeShippingThreshold) * 100;
  const milestones = [
    { label: t("milestoneStart"), sub: null, pos: 0, Icon: Star },
    { label: formatMoney(minimumOrderAmount, locale, moneyOpts), sub: t("milestoneMinimum"), pos: milestonePos, Icon: ShoppingCart },
    { label: formatMoney(freeShippingThreshold, locale, moneyOpts), sub: t("milestoneFreeShipping"), pos: 100, Icon: Car },
  ];

  return (
    <div className="rounded-2xl border-2 border-border p-10 space-y-6">
      <div className="flex items-center gap-3">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold", badgeColor)}>
          <DeliveryIcon className="h-4 w-4" />
          {title}
        </span>
        <span className="text-sm text-text-secondary">{eta}</span>
      </div>

      {!isFast && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Gift className="h-4 w-4 shrink-0 text-primary" />
            <span>
              {freeShippingEligible
                ? t("freeShippingAchieved")
                : t("freeShippingProgress", { amount: freeShipRemaining.toFixed(0) })}
            </span>
          </div>

          <div className="relative py-6">
            <div className="relative h-2 w-full rounded-full bg-border-subtle">
              <div
                className={cn("h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r", fillGradient)}
                style={{ width: Math.min(100, freeShipPercent) + "%" }}
              >
                <div className="absolute inset-0 rounded-full bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,rgba(255,255,255,0.25)_6px,rgba(255,255,255,0.25)_12px)]" />
              </div>
            </div>

            {milestones.map((m) => {
              const reached = freeShipPercent >= m.pos;
              return (
                <div
                  key={m.pos}
                  className="absolute"
                  style={{ left: m.pos + "%", top: "50%", transform: "translate(-50%,-50%)" }}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-[3px] transition-all duration-300",
                      reached
                        ? activeColor + " shadow-md"
                        : "border-border bg-white",
                    )}
                  >
                    <m.Icon className={cn("h-4 w-4", reached ? "text-white" : "text-text-secondary")} />
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 mt-1 text-center" style={{ top: "100%" }}>
                    <div className={cn("text-xs font-bold whitespace-nowrap", reached ? activeText : "text-text-secondary")}>
                      {m.label}
                    </div>
                    {m.sub && (
                      <div className={cn("text-[10px] leading-tight whitespace-nowrap mt-px", reached ? "text-text-secondary" : "text-text-secondary/70")}>
                        {m.sub}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {freeShippingEligible && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-success">
              <Gift className="h-3.5 w-3.5" />
              {t("freeShippingAchieved")}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <ProductCartItem
            key={item.product_id + deliveryType}
            item={item}
            isPending={pendingItemIds?.has(item.product_id) ?? false}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>

      <Button
        size="lg"
        full
        disabled={!checkoutEnabled}
        className={isFast ? "bg-accent" : undefined}
        onClick={() => router.push(checkoutHref)}
      >
        <ShoppingBag className="h-4 w-4" aria-hidden />
        {isFast ? t("fastCheckout") : t("checkout")}
        <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
      </Button>

      {!checkoutEnabled && (
        <p className="text-center text-[11px] text-text-secondary">
          {t("minimumOrder", { amount: minimumOrderAmount })}
        </p>
      )}
    </div>
  );
}