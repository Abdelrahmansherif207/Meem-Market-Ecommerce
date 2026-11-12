"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { checkoutService, isGatewayEligible } from "@/features/checkout";
import { ApiError } from "@/shared/lib/api";
import { guestCheckoutService } from "../services/guestCheckoutService";
import { guestOrderTrackingService } from "../services/guestOrderTrackingService";
import {
  clearGuestOrderTokens,
  getGuestOrderTokens,
  saveGuestOrderTokens,
} from "../store/useGuestOrderTokensStore";
import { runWithGuestSession } from "../utils/guestErrors";
import {
  clearIdempotencyKey,
  getOrCreateIdempotencyKey,
} from "../utils/idempotency";
import { saveGuestPaymentReturnNote } from "../utils/paymentReturn";
import { CopyTrackingLink } from "./CopyTrackingLink";
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
  /** Set when the checkout form could not start the online payment. */
  paymentRetry?: boolean;
}

export function GuestOrderConfirmation({
  orderId,
  paymentRetry = false,
}: GuestOrderConfirmationProps) {
  const t = useTranslations("guestCheckout.confirmation");
  const tc = useTranslations("checkout");
  const locale = useLocale();

  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [canCancel, setCanCancel] = useState(false);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [cancelBlocked, setCancelBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadErrorStatus, setLoadErrorStatus] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const pollCountRef = useRef(0);
  const tokensSyncedRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const data = await guestCheckoutService.getOrder(orderId, locale);
      setOrder(data.order);
      setCanCancel(data.can_cancel);
      setLoadError(null);
      setLoadErrorStatus(null);
      // Pending online payments are polled until the backend confirms them;
      // an explicit retry request skips that wait.
      setConfirmingPayment(
        data.order.status !== "cancelled" &&
          data.order.payment_method === "online" &&
          data.order.payment_status === "payment-pending" &&
          !paymentRetry,
      );
      return data.order;
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      setLoadErrorStatus(status);
      setLoadError(
        status === 401 || status === 403 || status === 404
          ? t("notAccessible")
          : tc("errorProcessing"),
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [orderId, locale, t, tc, paymentRetry]);

  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  // Unresolved online payments: poll — the return redirect is never proof of
  // payment; only the backend state is authoritative (contract §6).
  useEffect(() => {
    if (!order) return;
    if (order.status === "cancelled") return;
    if (order.payment_method !== "online") return;
    if (order.payment_status !== "payment-pending") return;
    // The checkout form already knows the payment was never started.
    if (paymentRetry) {
      setConfirmingPayment(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
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
  }, [order, load, paymentRetry]);

  // Keep working track/cancel tokens in this browser. Tokens returned by checkout
  // are unusable, so a stored token is verified and re-issued when invalid.
  useEffect(() => {
    if (!order || order.status === "cancelled") return;
    if (tokensSyncedRef.current) return;

    let cancelled = false;

    const syncTokens = async () => {
      const stored = getGuestOrderTokens(orderId);
      if (stored?.trackingToken && stored.cancellationToken) {
        try {
          await guestOrderTrackingService.track(stored.trackingToken, locale);
          tokensSyncedRef.current = true;
          setTrackingToken(stored.trackingToken);
          return;
        } catch (error) {
          // Only re-issue when the token is definitively invalid.
          if (!(error instanceof ApiError) || error.status !== 404) {
            tokensSyncedRef.current = true;
            setTrackingToken(stored.trackingToken);
            return;
          }
        }
      }

      try {
        const tokens = await runWithGuestSession(locale, () =>
          guestCheckoutService.issueAccessTokens(orderId, locale),
        );
        if (cancelled) return;
        tokensSyncedRef.current = true;
        const issuedTrackingToken = tokens.tracking_revoked
          ? null
          : tokens.tracking_token;
        setTrackingToken(issuedTrackingToken);
        saveGuestOrderTokens({
          orderId,
          orderNumber: order.order_number,
          trackingToken: issuedTrackingToken,
          cancellationToken: tokens.cancellation_token,
        });
      } catch {
        // Retried on the next visit; the order itself is unaffected.
      }
    };

    void syncTokens();

    return () => {
      cancelled = true;
    };
  }, [order, orderId, locale]);

  const handleCancel = useCallback(async () => {
    if (!order) return;
    let stored = getGuestOrderTokens(orderId);

    // The page may still be issuing tokens (or the stored pair is stale).
    if (!stored?.cancellationToken) {
      try {
        const tokens = await runWithGuestSession(locale, () =>
          guestCheckoutService.issueAccessTokens(orderId, locale),
        );
        const issuedTrackingToken = tokens.tracking_revoked
          ? null
          : tokens.tracking_token;
        setTrackingToken(issuedTrackingToken);
        saveGuestOrderTokens({
          orderId,
          orderNumber: order.order_number,
          trackingToken: issuedTrackingToken,
          cancellationToken: tokens.cancellation_token,
        });
        stored = getGuestOrderTokens(orderId);
      } catch {
        // Reported below as missing.
      }
    }

    const cancellationToken = stored?.cancellationToken ?? null;
    if (!cancellationToken) {
      setCancelError(t("tokenMissing"));
      return;
    }

    setCancelling(true);
    setCancelError(null);
    try {
      await guestOrderTrackingService.cancel(cancellationToken, locale);
      clearGuestOrderTokens(orderId);
      setCancelBlocked(true);
      await load();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setCancelError(t("cancelBlocked"));
          setCancelBlocked(true);
        } else if (error.status === 422) {
          setCancelError(t("cancelUsed"));
          setCancelBlocked(true);
        } else {
          setCancelError(tc("errorProcessing"));
        }
      } else {
        setCancelError(tc("errors.network"));
      }
    } finally {
      setCancelling(false);
    }
  }, [order, orderId, locale, load, t, tc]);

  // Retry online payment after the initial initiation failed. The order and
  // cart are already consumed — this never resubmits checkout.
  const handleCompletePayment = useCallback(async () => {
    if (paying) return;
    setPaying(true);
    setPaymentError(null);
    try {
      const gateways = await checkoutService.getPaymentGateways(locale);
      const gateway = gateways.filter(isGatewayEligible)[0]?.code;
      if (!gateway) {
        setPaymentError(tc("errors.gatewayUnavailable"));
        return;
      }

      const paymentKey = getOrCreateIdempotencyKey(`payment-${orderId}`);
      const payment = await runWithGuestSession(locale, () =>
        guestCheckoutService.initiatePayment(
          orderId,
          { payment_method: "online", gateway },
          paymentKey,
          locale,
        ),
      );

      if (payment.url) {
        saveGuestPaymentReturnNote(orderId);
        window.location.href = payment.url;
        return;
      }

      clearIdempotencyKey(`payment-${orderId}`);
      await load();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409 || error.status === 422) {
          // The order is no longer payable (paid or cancelled).
          await load();
        } else if (error.status === 429) {
          setPaymentError(tc("errors.tooManyAttempts"));
        } else if (error.status === 400) {
          setPaymentError(tc("errors.cartNotFound"));
        } else {
          setPaymentError(tc("errorProcessing"));
        }
      } else {
        setPaymentError(tc("errors.network"));
      }
    } finally {
      setPaying(false);
    }
  }, [paying, locale, orderId, load, tc]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loadError || !order) {
    const accessDenied =
      loadErrorStatus === 401 || loadErrorStatus === 403 || loadErrorStatus === 404;
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
        <p className="text-sm text-text-secondary">{loadError}</p>
        {!accessDenied && (
          <Button type="button" variant="outline" className="mt-4" onClick={load}>
            {tc("retry")}
          </Button>
        )}
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
  const canRetryPayment =
    order.payment_method === "online" &&
    order.payment_status === "payment-pending" &&
    !cancelled &&
    !confirmingPayment;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {confirmingPayment && (
          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            {t("confirmingPayment")}
          </div>
        )}
        {paymentError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {paymentError}
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
          {canRetryPayment && (
            <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">{t("paymentRetryHint")}</p>
              <Button full onClick={handleCompletePayment} loading={paying}>
                {t("completePayment")}
              </Button>
            </div>
          )}
          <Link
            href={
              trackingToken
                ? `/track-order#token=${encodeURIComponent(trackingToken)}`
                : "/track-order"
            }
            className="block rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary/40 hover:text-primary"
          >
            {t("trackOrder")}
          </Link>
          {trackingToken && <CopyTrackingLink token={trackingToken} />}
          {canCancel && !cancelled && !cancelBlocked && (
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
