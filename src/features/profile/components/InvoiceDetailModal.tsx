"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X, ExternalLink, Loader2, Package, MapPin, CreditCard, Receipt } from "lucide-react";
import { invoiceService } from "../services/invoiceService";
import type { InvoiceListItem, InvoiceDetail } from "../types";
import { InvoiceDetailSkeleton } from "./InvoiceDetailSkeleton";

interface InvoiceDetailModalProps {
  invoice: InvoiceListItem;
  open: boolean;
  onClose: () => void;
}

export function InvoiceDetailModal({ invoice, open, onClose }: InvoiceDetailModalProps) {
  const t = useTranslations("profile.invoices");
  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setDetail(null);
    setLoading(true);
    setError(null);

    invoiceService
      .getByUuid(invoice.uuid)
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : t("detailLoadError")))
      .finally(() => setLoading(false));
  }, [open, invoice.uuid, t]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const snapshot = detail?.snapshot;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-text-primary">
            {invoice.invoice_number}
          </h3>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && <InvoiceDetailSkeleton />}

        {error && (
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {detail && snapshot && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary">{t("orderNumber", { number: snapshot.order.order_number })}</p>
                <p className="text-sm font-semibold text-text-primary">
                  {new Date(detail.generated_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${
                detail.status === "ready" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              }`}>
                {t(`status.${detail.status}`, { defaultValue: detail.status })}
              </span>
            </div>

            <div className="rounded-xl bg-surface p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Receipt className="h-4 w-4" />
                {t("pricing")}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">{t("subtotal")}</span>
                  <span className="font-medium text-text-primary">{snapshot.pricing_breakdown.subtotal} {snapshot.pricing_breakdown.currency}</span>
                </div>
                {snapshot.pricing_breakdown.shipping_price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t("shipping")}</span>
                    <span className="font-medium text-text-primary">{snapshot.pricing_breakdown.shipping_price} {snapshot.pricing_breakdown.currency}</span>
                  </div>
                )}
                {snapshot.pricing_breakdown.promotion_discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t("discount")}</span>
                    <span className="font-medium text-green-600">-{snapshot.pricing_breakdown.promotion_discount} {snapshot.pricing_breakdown.currency}</span>
                  </div>
                )}
                {snapshot.pricing_breakdown.coupon_discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t("discount")}</span>
                    <span className="font-medium text-green-600">-{snapshot.pricing_breakdown.coupon_discount} {snapshot.pricing_breakdown.currency}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-semibold text-text-primary">{t("total")}</span>
                  <span className="font-bold text-text-primary">{snapshot.pricing_breakdown.total} {snapshot.pricing_breakdown.currency}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-surface p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Package className="h-4 w-4" />
                {t("items")}
              </div>
              <div className="space-y-3">
                {snapshot.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text-primary truncate">{item.product_name}</p>
                      <p className="text-xs text-text-secondary">
                        {item.product_sku} &middot; {item.quantity} x {item.unit_price} {snapshot.pricing_breakdown.currency}
                      </p>
                    </div>
                    <p className="font-semibold text-text-primary shrink-0 ml-3">
                      {item.total_price} {snapshot.pricing_breakdown.currency}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-surface p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <MapPin className="h-4 w-4" />
                {snapshot.fulfillment.type === "pickup" ? t("pickupLocation") : t("deliveryAddress")}
              </div>
              {snapshot.fulfillment.type === "pickup" && snapshot.pickup_location ? (
                <div className="text-sm text-text-secondary space-y-1">
                  <p className="font-medium text-text-primary">{snapshot.pickup_location.name}</p>
                  <p>{snapshot.pickup_location.address}</p>
                  <p>{snapshot.pickup_location.phone}</p>
                </div>
              ) : (
                <div className="text-sm text-text-secondary space-y-1">
                  {snapshot.shipping_address.street && <p>{snapshot.shipping_address.street}</p>}
                  <p>{[snapshot.shipping_address.city, snapshot.shipping_address.state].filter(Boolean).join(", ")}</p>
                  <p>{snapshot.shipping_address.country}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-surface p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <CreditCard className="h-4 w-4" />
                {t("paymentMethod")}
              </div>
              <p className="text-sm text-text-secondary capitalize">{snapshot.payment.method.replace(/_/g, " ")}</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {detail.download_url && (
                <a
                  href={detail.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-border px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("downloadPdf")}
                </a>
              )}
              <a
                href={detail.verification_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                {t("verify")}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
