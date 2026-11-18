"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
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
import {
  formatGuestDateTime,
  guestStatusKey,
  guestStatusTone,
  isKnownGuestStatus,
} from "../lib/format";
import { isGuestOrderPaid, isGuestPaymentPending } from "../lib/contract";
import { CopyTrackingLink } from "./CopyTrackingLink";
import { GuestCancelDialog } from "./GuestCancelDialog";
import type { GuestCancelResult, GuestOrder } from "../types";

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 30;

interface GuestOrderConfirmationProps {
  orderId: number;
  /** Set when the checkout form could not start the online payment. */
  paymentRetry?: boolean;
}

/**
 * Guest order confirmation.
 *
 * Loaded from the cookie-owned order endpoint (no raw token in the URL). The
 * backend is the only authority on payment state: when an online payment is
 * still pending the page polls until it resolves or the attempt budget ends.
 * Cancellation uses the raw token stored in this browser; a successful cancel
 * survives a failed refresh because the order is updated locally first.
 */
export function GuestOrderConfirmation({
  orderId,
  paymentRetry = false,
}: GuestOrderConfirmationProps) {
  const t = useTranslations("guestCheckout.confirmation");
  const tg = useTranslations("guestCheckout");
  const tc = useTranslations("checkout");
  const locale = useLocale();

  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [cancellationToken, setCancellationToken] = useState<string | null>(
    null,
  );
  const [cancelBlocked, setCancelBlocked] = useState(false);
  const [cancelledDone, setCancelledDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadErrorStatus, setLoadErrorStatus] = useState<number | null>(null);
  const [cancelDialogToken, setCancelDialogToken] = useState<string | null>(
    null,
  );
  const [cancelPreparing, setCancelPreparing] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [pollTick, setPollTick] = useState(0);
  const pollCountRef = useRef(0);
  const tokensAttemptedRef = useRef(false);

  const statusLabel = useCallback(
    (value: string | null | undefined) => {
      if (!value) return "—";
      return isKnownGuestStatus(value) ? tg(`status.${guestStatusKey(value)}`) : value;
    },
    [tg],
  );

  const load = useCallback(async (): Promise<GuestOrder | null> => {
    try {
      const data = await guestCheckoutService.getOrder(orderId, locale);
      setOrder(data);
      setLoadError(null);
      setLoadErrorStatus(null);
      return data;
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
  }, [orderId, locale, t, tc]);

  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  // Unresolved online payments: the return redirect is never proof of
  // payment — only backend state is authoritative.
  useEffect(() => {
    if (!order) return;
    if (!isGuestPaymentPending(order)) {
      setConfirmingPayment(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    if (paymentRetry) {
      setConfirmingPayment(false);
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
      if (updated && !isGuestPaymentPending(updated)) {
        setConfirmingPayment(false);
      } else if (!updated) {
        // A failed refresh must not freeze the "confirming" state — retry
        // until the attempt budget is exhausted.
        setPollTick((tick) => tick + 1);
      }
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [order, load, paymentRetry, pollTick]);

  // Resolve a working tracking token once: prefer the tokens saved by
  // checkout, verify them, and re-issue only when the backend rejects them.
  // Cancelled orders still expose a valid tracking timeline.
  useEffect(() => {
    if (!order) return;
    if (tokensAttemptedRef.current) return;
    tokensAttemptedRef.current = true;

    let cancelled = false;

    const syncTokens = async () => {
      const stored = getGuestOrderTokens(orderId);
      if (stored?.trackingToken) {
        setTrackingToken(stored.trackingToken);
        setCancellationToken(stored.cancellationToken ?? null);
        try {
          await guestOrderTrackingService.track(stored.trackingToken, locale);
          return;
        } catch (error) {
          // Only re-issue when the token is definitively invalid.
          if (!(error instanceof ApiError) || error.status !== 404) return;
        }
      }

      try {
        const tokens = await runWithGuestSession(locale, () =>
          guestCheckoutService.issueAccessTokens(orderId, locale),
        );
        if (cancelled) return;
        const issuedTrackingToken = tokens.trackingRevoked
          ? null
          : tokens.trackingToken;
        setTrackingToken(issuedTrackingToken);
        setCancellationToken(tokens.cancellationToken);
        saveGuestOrderTokens({
          orderId,
          orderNumber: order.orderNumber,
          trackingToken: issuedTrackingToken,
          cancellationToken: tokens.cancellationToken,
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

  const openCancelDialog = useCallback(async () => {
    if (!order || cancelPreparing) return;
    setCancelError(null);
    setCancelPreparing(true);

    try {
      let stored = getGuestOrderTokens(orderId);
      if (!stored?.cancellationToken) {
        try {
          const tokens = await runWithGuestSession(locale, () =>
            guestCheckoutService.issueAccessTokens(orderId, locale),
          );
          const issuedTrackingToken = tokens.trackingRevoked
            ? null
            : tokens.trackingToken;
          setTrackingToken(issuedTrackingToken);
          setCancellationToken(tokens.cancellationToken);
          saveGuestOrderTokens({
            orderId,
            orderNumber: order.orderNumber,
            trackingToken: issuedTrackingToken,
            cancellationToken: tokens.cancellationToken,
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
      setCancelDialogToken(cancellationToken);
    } finally {
      setCancelPreparing(false);
    }
  }, [cancelPreparing, locale, order, orderId, t]);

  const handleCancelled = useCallback(
    (result: GuestCancelResult) => {
      if (!order) return;
      const stored = getGuestOrderTokens(orderId);
      // The cancellation token is spent; keep the tracking token so the
      // shopper can still follow the cancelled order.
      const trackingTokenToKeep = stored?.trackingToken ?? trackingToken;
      if (trackingTokenToKeep) {
        saveGuestOrderTokens({
          orderId,
          orderNumber: order.orderNumber,
          trackingToken: trackingTokenToKeep,
          cancellationToken: null,
        });
      } else {
        clearGuestOrderTokens(orderId);
      }
      setCancellationToken(null);
      setCancelledDone(true);
      setCancelBlocked(true);
      // Update locally so a failed refresh cannot hide a successful cancel.
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: result.order.status || "cancelled",
              canCancel: false,
            }
          : prev,
      );
      void load();
    },
    [load, order, orderId, trackingToken],
  );

  // Retry online payment after initiation failed. The order and cart are
  // already consumed — this never resubmits checkout.
  const handleCompletePayment = useCallback(async () => {
    if (paying || !order) return;
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
        window.location.assign(payment.url);
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
        } else {
          setPaymentError(tc("errorProcessing"));
        }
      } else {
        setPaymentError(tc("errors.network"));
      }
    } finally {
      setPaying(false);
    }
  }, [paying, order, locale, orderId, load, tc]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    const accessDenied =
      loadErrorStatus === 401 ||
      loadErrorStatus === 403 ||
      loadErrorStatus === 404;
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
        <p className="text-sm text-text-secondary">
          {loadError ?? tc("errorProcessing")}
        </p>
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
  const paymentPending = isGuestPaymentPending(order);
  const canRetryPayment =
    order.paymentMethod === "online" &&
    paymentPending &&
    !confirmingPayment &&
    !paying;
  const currency = order.currency ?? undefined;
  const address = order.address;
  const addressLines = address
    ? [address.building, address.street, address.city, address.details].filter(
        (line): line is string => Boolean(line && line.trim()),
      )
    : [];

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
        {cancelledDone && (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {t("cancelledDone")}
          </div>
        )}

        <div className="rounded-2xl border-2 border-border bg-white p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {cancelled ? (
                <XCircle className="h-8 w-8 text-red-500" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              )}
              <div>
                <p className="text-xs text-text-secondary">{t("orderNumber")}</p>
                <p className="text-lg font-bold text-text-primary" dir="ltr">
                  {order.orderNumber}
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${guestStatusTone(
                order.status,
              )}`}
            >
              {statusLabel(order.status)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-text-secondary">{t("paymentStatus")}</p>
              <p className="font-semibold text-text-primary">
                {statusLabel(order.paymentStatus)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">
                {t("fulfillmentStatus")}
              </p>
              <p className="font-semibold text-text-primary">
                {statusLabel(order.fulfillmentStatus)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t("paymentMethod")}</p>
              <p className="font-semibold text-text-primary">
                {order.paymentMethod === "cod"
                  ? t("codLabel")
                  : t("onlineLabel")}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t("placedAt")}</p>
              <p className="font-semibold text-text-primary">
                {formatGuestDateTime(order.createdAt, locale)}
              </p>
            </div>
          </div>
          {order.paymentMethod === "cod" &&
            !cancelled &&
            !isGuestOrderPaid(order) && (
              <p className="rounded-xl bg-surface px-4 py-3 text-xs text-text-secondary">
                {t("codNote")}
              </p>
            )}
          {order.paymentMethod === "online" &&
            !cancelled &&
            order.paymentStatus === "failed" && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
                {t("paymentFailedNote")}
              </p>
            )}
        </div>

        <div className="rounded-2xl border-2 border-border bg-white p-5 sm:p-6 space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider rtl:tracking-normal text-text-primary">
            <Package className="h-4 w-4" />
            {t("items")}
          </h2>
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li
                key={item.id || `${item.productId}-${item.name}`}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0 rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                      <Package className="h-5 w-5 text-text-muted" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {item.slug ? (
                        <Link
                          href={`/products/${item.slug}`}
                          className="hover:text-primary"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </p>
                    {item.variantLabel && (
                      <p className="text-xs text-text-secondary">
                        {item.variantLabel}
                      </p>
                    )}
                    <p className="text-xs text-text-secondary">
                      × {item.quantity}
                    </p>
                  </div>
                </div>
                <Price
                  amount={item.total}
                  currency={currency}
                  className="shrink-0 text-sm font-medium text-text-primary"
                />
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">{tc("subtotal")}</span>
              <Price
                amount={order.subtotal}
                currency={currency}
                className="font-medium text-text-primary"
              />
            </div>
            {order.shippingPrice > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{tc("shipping")}</span>
                <Price
                  amount={order.shippingPrice}
                  currency={currency}
                  className="font-medium text-text-primary"
                />
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex items-center justify-between text-success">
                <span>{t("discount")}</span>
                <Price
                  amount={order.discount}
                  currency={currency}
                  prefix="-"
                  className="font-medium"
                />
              </div>
            )}
            <div className="flex items-center justify-between font-semibold">
              <span className="text-xs font-medium uppercase tracking-wider rtl:tracking-normal text-text-secondary">
                {tc("total")}
              </span>
              <Price
                amount={order.total}
                currency={currency}
                className="text-base font-medium text-text-primary"
              />
            </div>
          </div>
        </div>

        {(addressLines.length > 0 || order.notes) && (
          <div className="rounded-2xl border-2 border-border bg-white p-5 sm:p-6 space-y-3">
            {addressLines.length > 0 && (
              <div className="space-y-1">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider rtl:tracking-normal text-text-primary">
                  <Truck className="h-4 w-4" />
                  {t("deliveryDetails")}
                </h2>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {addressLines.join(" — ")}
                </p>
              </div>
            )}
            {order.notes && (
              <div className="space-y-1 border-t border-border pt-3">
                <p className="text-xs font-semibold text-text-primary">
                  {tc("notes")}
                </p>
                <p className="text-sm text-text-secondary">{order.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-4 lg:sticky lg:top-24">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider rtl:tracking-normal text-text-primary">
            <Clock className="h-4 w-4" />
            {t("nextSteps")}
          </h3>
          {canRetryPayment && (
            <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">{t("paymentRetryHint")}</p>
              <Button full onClick={handleCompletePayment} loading={paying}>
                <CreditCard className="h-4 w-4" />
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
          {trackingToken && (
            <CopyTrackingLink
              token={trackingToken}
              cancellationToken={
                order.canCancel && !cancelled ? cancellationToken : null
              }
            />
          )}

          {order.canCancel && !cancelled && !cancelBlocked && (
            <>
              {paymentPending ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                  {t("cancelBlocked")}
                </p>
              ) : (
                <Button
                  variant="outline"
                  full
                  onClick={() => void openCancelDialog()}
                  loading={cancelPreparing}
                  disabled={cancelPreparing}
                >
                  {t("cancelOrder")}
                </Button>
              )}
            </>
          )}

          <Link
            href="/"
            className="block text-center text-xs font-semibold text-text-secondary hover:text-primary"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>

      {cancelDialogToken && (
        <GuestCancelDialog
          cancellationToken={cancelDialogToken}
          orderNumber={order.orderNumber}
          onClose={() => setCancelDialogToken(null)}
          onCancelled={handleCancelled}
          onBlocked={() => setCancelBlocked(true)}
        />
      )}
    </div>
  );
}
