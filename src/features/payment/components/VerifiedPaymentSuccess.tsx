"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle, Clock3, HelpCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { orderService } from "@/features/profile";
import type { OrderDetail } from "@/features/profile/types";
import {
  fromOrderItem,
  trackPurchase,
  useOncePerKeyEffect,
} from "@/features/analytics";
import { QRDisplay } from "./QRDisplay";

type VerifyState = "loading" | "success" | "verifying" | "unconfirmed";

interface VerifiedPaymentSuccessProps {
  orderId?: string;
  transactionId?: string;
}

const CONFIRMED_STATUSES = new Set(["completed", "delivered", "processing"]);
const PAY_LATER_METHODS = new Set(["cod", "pay_at_cashier"]);
const VERIFY_POLL_INTERVAL_MS = 2_500;
const VERIFY_POLL_MAX_ATTEMPTS = 6;

/**
 * The order payload types `coupon` loosely; extract the code only when the
 * backend actually ships one (never invent a coupon value).
 */
function extractCouponCode(coupon: unknown): string | null {
  if (!coupon || typeof coupon !== "object") return null;
  const record = coupon as Record<string, unknown>;
  const code = record.code ?? record.coupon_code;
  return typeof code === "string" && code.trim() ? code.trim() : null;
}

export function VerifiedPaymentSuccess({ orderId, transactionId }: VerifiedPaymentSuccessProps) {
  const t = useTranslations("payment");
  const locale = useLocale();
  const parsedOrderId = useMemo(() => {
    if (!orderId) return null;
    const id = Number(orderId);
    return Number.isInteger(id) && id > 0 ? id : null;
  }, [orderId]);
  const [state, setState] = useState<VerifyState>(() =>
    parsedOrderId === null ? "unconfirmed" : "loading",
  );
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  /** Full order kept for the GA4 purchase event. */
  const [order, setOrder] = useState<OrderDetail | null>(null);

  // GA4 purchase — ONLY when the backend confirms the order (completed/
  // delivered/processing, or COD/pay-at-cashier which confirm immediately).
  // trackPurchase deduplicates by transaction_id, so polls, Strict Mode and
  // page refreshes never repeat the event.
  useOncePerKeyEffect(
    state === "success" && order ? `purchase_${order.order_number || order.id}` : null,
    () => {
      if (!order) return;
      // Shipping = delivery fee + fast-shipping surcharge, as charged.
      const shipping = (order.shipping_price || 0) + (order.fast_shipping_fee || 0);
      trackPurchase({
        transactionId: String(order.order_number || order.id),
        value: order.converted_total > 0 ? order.converted_total : order.total,
        currency: order.currency,
        shipping: Math.round(shipping * 1000) / 1000,
        coupon: extractCouponCode(order.coupon),
        items: (order.order_items ?? []).map(fromOrderItem),
      });
    },
  );

  useEffect(() => {
    if (!parsedOrderId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

  const check = async () => {
    try {
      const order = await orderService.getById(parsedOrderId, locale);
      if (cancelled) return;
      setOrder(order);
      setPaymentMethod(order.payment_method);

      // New order-flow catalog codes may be present in current_status.code;
      // fall back to the legacy status string for older payloads.
      const statusCode = order.current_status?.code ?? order.status;
      const confirmed =
        CONFIRMED_STATUSES.has(statusCode) ||
        (statusCode === "pending" && PAY_LATER_METHODS.has(order.payment_method));
      if (confirmed) {
        setState("success");
        return;
      }

      if (statusCode === "pending" && order.payment_method === "online") {
          attempts += 1;
          if (attempts < VERIFY_POLL_MAX_ATTEMPTS) {
            timer = setTimeout(check, VERIFY_POLL_INTERVAL_MS);
            return;
          }
          setState("verifying");
          return;
        }

        setState("unconfirmed");
      } catch {
        if (!cancelled) setState("unconfirmed");
      }
    };

    check();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [parsedOrderId, locale]);

  if (state === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <Loader2 className="mb-4 size-10 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  if (state === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-amber-100 p-4">
          <Clock3 className="size-16 text-amber-600" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-text-primary">{t("success.verifyingTitle")}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t("success.verifyingSubtitle")}</p>
        <Link
          href="/profile"
          className="mt-8 inline-flex items-center rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
        >
          {t("success.viewOrders")}
        </Link>
      </div>
    );
  }

  if (state === "unconfirmed") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-gray-100 p-4">
          <HelpCircle className="size-16 text-text-secondary" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-text-primary">{t("success.unconfirmedTitle")}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t("success.unconfirmedSubtitle")}</p>
        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/profile"
            className="inline-flex items-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            {t("success.viewOrders")}
          </Link>
          <Link
            href="/payment"
            className="inline-flex items-center rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
          >
            {t("failed.tryAgain")}
          </Link>
        </div>
      </div>
    );
  }

  const subtitleKey =
    paymentMethod === "cod"
      ? "success.subtitleCod"
      : paymentMethod === "pay_at_cashier"
        ? "success.subtitleCashier"
        : "success.subtitle";

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-green-100 p-4">
        <CheckCircle className="size-16 text-success" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-text-primary">{t("success.title")}</h1>
      <p className="mt-2 text-sm text-text-secondary">{t(subtitleKey)}</p>

      <QRDisplay />

      {(orderId || transactionId) && (
        <div className="mt-6 w-full max-w-sm space-y-3 rounded-2xl border-2 border-border bg-white p-5 text-left">
          {orderId && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                {t("success.orderId")}
              </span>
              <span className="text-sm font-semibold text-text-primary">#{orderId}</span>
            </div>
          )}
          {transactionId && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                {t("success.transactionId")}
              </span>
              <span className="text-sm font-mono font-semibold text-text-primary">{transactionId}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          {t("success.goHome")}
        </Link>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
        >
          {t("success.viewOrders")}
        </Link>
      </div>
    </div>
  );
}
