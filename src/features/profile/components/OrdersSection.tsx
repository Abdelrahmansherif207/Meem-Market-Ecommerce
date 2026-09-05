"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { orderService } from "../services/orderService";
import { invoiceService } from "../services/invoiceService";
import type { Order } from "../types";
import { OrderCard } from "./OrderCard";
import { OrderDetailModal } from "./OrderDetailModal";
import { OrdersSkeleton } from "./skeletons/OrdersSkeleton";
import { OrdersPagination } from "./OrdersPagination";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/shared/utils/cn";

const STATUS_FILTERS = ["all", "pending", "processing", "completed", "delivered", "cancelled"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export function OrdersSection() {
  const t = useTranslations("profile.orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (page: number, status: StatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 15, ...(status !== "all" ? { status } : {}) };
      const data = await orderService.getAll(params);
      setOrders(data.data);
      setLastPage(data.links.last_page);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrders(currentPage, activeStatus);
  }, [currentPage, activeStatus, fetchOrders]);

  useEffect(() => {
    if (!invoiceError) return;
    const timer = setTimeout(() => setInvoiceError(null), 5000);
    return () => clearTimeout(timer);
  }, [invoiceError]);

  const handleStatusChange = useCallback((status: StatusFilter) => {
    setActiveStatus(status);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleViewDetails = useCallback((order: Order) => {
    setSelectedOrder(order);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const handleViewInvoice = useCallback(async (invoiceId: string) => {
    setSelectedOrder(null);
    try {
      const detail = await invoiceService.getByUuid(invoiceId);
      if (detail.download_url) {
        window.open(detail.download_url, "_blank");
      } else {
        setInvoiceError(t("invoiceNotReady"));
      }
    } catch {
      setInvoiceError(t("invoiceLoadError"));
    }
  }, [t]);

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => handleStatusChange(status)}
            className={cn(
              "flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
              activeStatus === status
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:text-text-primary",
            )}
          >
            {t(status)}
          </button>
        ))}
      </div>

      {loading && <OrdersSkeleton />}

      {!loading && error && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {invoiceError && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {invoiceError}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <EmptyState
          size="compact"
          variant="orders"
          title={t("empty")}
          description={t("emptyDescription")}
        />
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          <OrdersPagination
            currentPage={currentPage}
            lastPage={lastPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          open={!!selectedOrder}
          onClose={handleCloseModal}
          onViewInvoice={handleViewInvoice}
        />
      )}
    </div>
  );
}
