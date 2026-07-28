"use client";

import { useTranslations } from "next-intl";
import { Truck, Gift, Star, ShoppingCart, Car } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { DeliveryType, HydratedCartItem } from "../types";
import { ProductCartItem } from "./ProductCartItem";
import { calcSubtotal, calcTotalQuantity, isFreeShipping, canCheckout } from "../utils";

interface CartSectionProps {
  deliveryType: DeliveryType;
  items: HydratedCartItem[];
  /** Set of product IDs whose cart item currently has an in-flight API request. */
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

  const subtotal = calcSubtotal(
    items.map((i) => ({ price: i.current_price, quantity: i.quantity })),
  );
  const totalQuantity = calcTotalQuantity(items);

  const freeShippingThreshold = 300;
  const freeShippingEligible = isFreeShipping(subtotal, freeShippingThreshold);
  const checkoutEnabled = canCheckout(subtotal, minimumOrderAmount);

  const freeShipPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const freeShipRemaining = Math.max(0, freeShippingThreshold - subtotal);

  const badgeColor = "bg-primary text-white";
  const borderColor = "border-border";
  const fillGradient = "from-blue-600 to-blue-400";
  const activeColor = "border-blue-500 bg-blue-500";
  const activeText = "text-blue-600";
  const DeliveryIcon = Car;
  const title = t("scheduledTitle");
  const eta = t("scheduledEta");

  if (items.length === 0) return null;

  const milestonePos = (minimumOrderAmount / freeShippingThreshold) * 100;
  const milestones = [
    { label: "Start", sub: null, pos: 0, Icon: Star },
    { label: minimumOrderAmount + " K.D", sub: "Minimum", pos: milestonePos, Icon: ShoppingCart },
    { label: freeShippingThreshold + " K.D", sub: "Free Shipping", pos: 100, Icon: DeliveryIcon },
  ];

  return (
    <div className={cn("rounded-2xl border-2 p-10 space-y-6", borderColor)}>
      <div className="flex items-center gap-3">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold", badgeColor)}>
          <Truck className="h-4 w-4" />
          {title}
        </span>
        <span className="text-sm text-text-secondary">{eta}</span>
      </div>

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
          <div className="relative h-2 w-full rounded-full bg-gray-100">
            <div
              className={cn("h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r", fillGradient)}
              style={{ width: Math.min(100, freeShipPercent) + "%" }}
            >
              <div className="absolute inset-0 rounded-full bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,rgba(255,255,255,0.2)_6px,rgba(255,255,255,0.2)_12px)]" />
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
                      : "border-gray-300 bg-white",
                  )}
                >
                  <m.Icon className={cn("h-4 w-4", reached ? "text-white" : "text-gray-400")} />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 text-center" style={{ top: "100%" }}>
                  <div className={cn("text-xs font-bold whitespace-nowrap", reached ? activeText : "text-gray-400")}>
                    {m.label}
                  </div>
                  {m.sub && (
                    <div className={cn("text-[10px] leading-tight whitespace-nowrap mt-px", reached ? "text-gray-500" : "text-gray-300")}>
                      {m.sub}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {freeShippingEligible && (
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-green-600">
            <Gift className="h-3.5 w-3.5" />
            {t("freeShippingAchieved")}
          </div>
        )}
      </div>

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
    </div>
  );
}