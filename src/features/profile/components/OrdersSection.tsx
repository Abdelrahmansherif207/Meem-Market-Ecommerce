"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { orderService } from "../services/orderService";
import type { Order } from "../types";
import { OrderCard } from "./OrderCard";
import { OrdersSkeleton } from "./skeletons/OrdersSkeleton";
import EmptyState from "@/components/ui/EmptyState";

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
      <EmptyState
        size="compact"
        variant="orders"
        title={t("empty")}
        description={t("emptyDescription")}
      />
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
