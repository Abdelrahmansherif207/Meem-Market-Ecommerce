"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X, Package, MapPin, CreditCard, Truck, Store, ExternalLink } from "lucide-react";
import { orderService } from "../services/orderService";
import type { Order, OrderDetail } from "../types";
import { OrderDetailSkeleton } from "./OrderDetailSkeleton";

interface OrderDetailModalProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  onViewInvoice: (invoiceId: string) => void;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  processing: "bg-blue-100 text-blue-700",
  delivered: "bg-purple-100 text-purple-700",
};

export function OrderDetailModal({ order, open, onClose, onViewInvoice }: OrderDetailModalProps) {
  const t = useTranslations("profile.orders");
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setDetail(null);
    setLoading(true);
    setError(null);

    orderService
      .getById(order.id)
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : t("detailLoadError")))
      .finally(() => setLoading(false));
  }, [open, order.id, t]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const statusClass = statusColors[order.status] || "bg-gray-100 text-gray-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-text-primary">
            {t("orderNumber", { number: order.order_number })}
          </h3>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && <OrderDetailSkeleton />}

        {error && (
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {detail && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text-primary">
                  {new Date(detail.created_at).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  {detail.fulfillment_type === "pickup" ? (
                    <Store className="h-3.5 w-3.5" />
                  ) : (
                    <Truck className="h-3.5 w-3.5" />
                  )}
                  <span>{t(detail.fulfillment_type)}</span>
                </div>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusClass}`}>
                {t(`status.${detail.status}`, { defaultValue: detail.status })}
              </span>
            </div>

            <div className="rounded-xl bg-surface p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Package className="h-4 w-4" />
                {t("items")}
              </div>
              <div className="space-y-3">
                {detail.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-lg bg-white shrink-0 overflow-hidden border border-border">
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
                        {item.quantity} x {item.unit_price} {detail.currency}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-text-primary shrink-0">
                      {item.total_price} {detail.currency}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-surface p-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">{t("subtotal")}</span>
                  <span className="font-medium text-text-primary">{detail.subtotal} {detail.currency}</span>
                </div>
                {detail.shipping_price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t("shipping")}</span>
                    <span className="font-medium text-text-primary">{detail.shipping_price} {detail.currency}</span>
                  </div>
                )}
                {detail.fast_shipping_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t("fastShipping")}</span>
                    <span className="font-medium text-text-primary">{detail.fast_shipping_fee} {detail.currency}</span>
                  </div>
                )}
                {detail.promotion_discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t("promotionDiscount")}</span>
                    <span className="font-medium text-green-600">-{detail.promotion_discount} {detail.currency}</span>
                  </div>
                )}
                {detail.coupon_discount != null && detail.coupon_discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t("couponDiscount")}</span>
                    <span className="font-medium text-green-600">-{detail.coupon_discount} {detail.currency}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-semibold text-text-primary">{t("total")}</span>
                  <span className="font-bold text-text-primary">{detail.total} {detail.currency}</span>
                </div>
              </div>
            </div>

            {detail.fulfillment_type === "pickup" && detail.pickup_location && (
              <div className="rounded-xl bg-surface p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <MapPin className="h-4 w-4" />
                  {t("pickupLocation")}
                </div>
                <p className="text-sm text-text-secondary">{detail.pickup_location.store_name}</p>
              </div>
            )}

            <div className="rounded-xl bg-surface p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <CreditCard className="h-4 w-4" />
                {t("paymentMethod")}
              </div>
              <p className="text-sm text-text-secondary capitalize">{detail.payment_method.replace(/_/g, " ")}</p>
            </div>

            {detail.order_has_invoice && detail.invoice_id && (
              <button
                type="button"
                onClick={() => onViewInvoice(detail.invoice_id!)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-border px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
              >
                <ExternalLink className="h-4 w-4" />
                {t("viewInvoice")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
