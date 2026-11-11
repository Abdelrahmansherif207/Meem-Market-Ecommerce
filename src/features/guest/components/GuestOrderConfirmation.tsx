"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Package } from "lucide-react";
import { useRouter as useIntlRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { ApiError } from "@/shared/lib/api";
import { guestCheckoutService } from "../services/guestCheckoutService";
import { guestOrderTrackingService } from "../services/guestOrderTrackingService";
import {
  clearGuestOrderTokens,
  getGuestOrderTokens,
  saveGuestOrderTokens,
} from "../store/useGuestOrderTokensStore";
import { runWithGuestSession } from "../utils/guestErrors";
import type { GuestOrder } from "../types";

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 30;

function statusTone(status: string): string {
  if (["cancelled", "failed"].includes(status)) return "bg-red-100 text-red-700";
  if (["delivered", "completed", "paid"].includes(status)) return "bg-green-100 text-green-700";
  if (["processing", "shipped", "out_for_delivery"].includes(status)) return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
}

interface GuestOrderConfirmationProps {
  orderId: number;
}

export function GuestOrderConfirmation({ orderId }: GuestOrderConfirmationProps) {
  const t = useTranslations("guestCheckout.confirmation");
  const tc = useTranslations("checkout");
  const intlRouter = useIntlRouter();
  const locale = useLocale();

  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [canCancel, setCanCancel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const pollCountRef = useRef(0);

  const load = useCallback(async () => {
    try {
      const data = await guestCheckoutService.getOrder(orderId, locale);
      setOrder(data.order);
      setCanCancel(data.can_cancel);
      setLoadError(null);
      return data.order;
    } catch (error) {
      setLoadError(
        error instanceof ApiError && error.status === 404
          ? t("notAccessible")
          : tc("errorProcessing"),
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [orderId, locale, t, tc]);

  useEffect(() => {
    load();
  }, [load]);

  // Unresolved online payments: poll — the return redirect is never proof of
  // payment; only the backend state is authoritative (contract §6).
  useEffect(() => {
    if (!order) return;
    if (order.payment_method !== "online") return;
    if (order.payment_status !== "payment-pending") return;
    if (pollCountRef.current >= MAX_POLLS) {
      setConfirmingPayment(false);
      return;
    }
    setConfirmingPayment(true);
    const timer = setTimeout(async () => {
      pollCountRef.current += 1;
      const updated = await load();
      if (updated && updated.payment_status !== "payment-pending") {
        setConfirmingPayment(false);
      }
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [order, load]);

  // Recover public tokens when they were lost (e.g. refresh after redirect).
  useEffect(() => {
    if (!order) return;
    const stored = getGuestOrderTokens(orderId);
    if (stored?.trackingToken) return;
    let cancelled = false;
    runWithGuestSession(locale, () => guestCheckoutService.issueAccessTokens(orderId, locale))
      .then((tokens) => {
        if (cancelled) return;
        if (tokens.tracking_revoked) return;
        saveGuestOrderTokens({
          orderId,
          orderNumber: order.order_number,
          trackingToken: tokens.tracking_token,
          cancellationToken: tokens.cancellation_token,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [order, orderId, locale]);

  const handleCancel = useCallback(async () => {
    if (!order) return;
    const stored = getGuestOrderTokens(orderId);
    if (!stored?.cancellationToken) {
      setCancelError(t("tokenMissing"));
      return;
    }
    setCancelling(true);
    setCancelError(null);
    try {
      await guestOrderTrackingService.cancel(stored.cancellationToken, locale);
      clearGuestOrderTokens(orderId);
      await load();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) setCancelError(t("cancelBlocked"));
        else if (error.status === 422) setCancelError(t("cancelUsed"));
        else setCancelError(tc("errorProcessing"));
      } else {
        setCancelError(tc("errors.network"));
      }
    } finally {
      setCancelling(false);
    }
  }, [order, orderId, locale, load, t, tc]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
        <p className="text-sm text-text-secondary">{loadError}</p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-dark"
        >
          {t("backHome")}
        </Link>
      </div>
    );
  }

  const cancelled = order.status === "cancelled";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {confirmingPayment && (
          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            {t("confirmingPayment")}
          </div>
        )}
        {cancelError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {cancelError}
          </div>
        )}

        <div className="rounded-2xl border-2 border-border bg-white p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {cancelled ? (
                <AlertTriangle className="h-8 w-8 text-red-500" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              )}
              <div>
                <p className="text-xs text-text-secondary">{t("orderNumber")}</p>
                <p className="text-lg font-bold text-text-primary" dir="ltr">
                  {order.order_number}
                </p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-text-secondary">{t("paymentStatus")}</p>
              <p className="font-semibold text-text-primary">{order.payment_status}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t("fulfillmentStatus")}</p>
              <p className="font-semibold text-text-primary">{order.fulfillment_status}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t("paymentMethod")}</p>
              <p className="font-semibold text-text-primary" dir="ltr">
                {order.payment_method === "cod" ? t("codLabel") : t("onlineLabel")}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t("placedAt")}</p>
              <p className="font-semibold text-text-primary" dir="ltr">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          {order.payment_method === "cod" && !cancelled && order.payment_status === "payment-pending" && (
            <p className="rounded-xl bg-surface px-4 py-3 text-xs text-text-secondary">
              {t("codNote")}
            </p>
          )}
        </div>

        <div className="rounded-2xl border-2 border-border bg-white p-5 sm:p-6 space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-primary">
            <Package className="h-4 w-4" />
            {t("items")}
          </h2>
          <ul className="divide-y divide-border">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-sm font-medium text-text-primary truncate">
                    {item.product.name}
                  </span>
                  <span className="text-xs text-text-secondary shrink-0">
                    × {item.quantity}
                  </span>
                </div>
                <Price amount={item.total_price} className="text-sm font-semibold text-text-primary" />
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">{tc("subtotal")}</span>
              <Price amount={order.subtotal} />
            </div>
            {(order.shipping_price ?? 0) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{tc("shipping")}</span>
                <Price amount={order.shipping_price ?? 0} />
              </div>
            )}
            <div className="flex items-center justify-between font-semibold">
              <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                {tc("total")}
              </span>
              <Price amount={order.total} className="text-base font-bold text-text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-4 lg:sticky lg:top-24">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-primary">
            <Clock className="h-4 w-4" />
            {t("nextSteps")}
          </h3>
          <Link
            href="/track-order"
            className="block rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary/40 hover:text-primary"
          >
            {t("trackOrder")}
          </Link>
          {canCancel && !cancelled && (
            <Button variant="outline" full onClick={handleCancel} loading={cancelling}>
              {t("cancelOrder")}
            </Button>
          )}
          <Link
            href="/"
            className="block text-center text-xs font-semibold text-text-secondary hover:text-primary"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
