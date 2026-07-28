"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { PackageOpen } from "lucide-react";
import { orderService } from "../services/orderService";
import type { Order } from "../types";
import { OrderCard } from "./OrderCard";
import { OrdersSkeleton } from "./skeletons/OrdersSkeleton";

export function OrdersSection() {
  const t = useTranslations("profile.orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    orderService.getAll()
      .then((data) => setOrders(data.data))
      .catch((err) => setError(err instanceof Error ? err.message : t("loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) return <OrdersSkeleton />;

  if (error) {
    return (
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PackageOpen className="mb-3 h-12 w-12 text-text-secondary/40" />
        <p className="text-sm font-semibold text-text-secondary">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
