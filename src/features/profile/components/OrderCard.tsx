"use client";

import { useTranslations } from "next-intl";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Order } from "../types";

interface OrderCardProps {
  order: Order;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
};

export function OrderCard({ order }: OrderCardProps) {
  const t = useTranslations("profile.orders");
  const [expanded, setExpanded] = useState(false);

  const statusClass = statusColors[order.status] || "bg-gray-100 text-gray-700";

  return (
    <div className="rounded-2xl border-2 border-border bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-text-secondary shrink-0" />
          <div>
            <p className="text-sm font-bold text-text-primary">{order.order_number}</p>
            <p className="text-xs text-text-secondary">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusClass}`}>
            {t(`status.${order.status}`, { defaultValue: order.status })}
          </span>
          <span className="text-sm font-bold text-text-primary">{order.total} K.D</span>
          {expanded ? <ChevronUp className="h-4 w-4 text-text-secondary" /> : <ChevronDown className="h-4 w-4 text-text-secondary" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-surface shrink-0 overflow-hidden">
                {item.product.image.thumbnail && (
                  <img
                    src={item.product.image.thumbnail}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary truncate">{item.product.name}</p>
                <p className="text-xs text-text-secondary">
                  {item.quantity} x {item.unit_price} K.D
                </p>
              </div>
              <p className="text-sm font-bold text-text-primary shrink-0">{item.total_price} K.D</p>
            </div>
          ))}

          <div className="flex justify-between border-t border-border pt-2 text-sm">
            <span className="font-semibold text-text-primary">{t("total")}</span>
            <span className="font-bold text-text-primary">{order.total} K.D</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">{t("discount")}</span>
              <span className="text-green-600">-{order.discount} K.D</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
