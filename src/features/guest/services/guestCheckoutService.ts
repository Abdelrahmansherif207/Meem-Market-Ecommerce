import type { ApiResponse } from "@/shared/types";
import {
  GUEST_CHECKOUT,
  guestOrderEndpoint,
  guestOrderPaymentEndpoint,
  guestOrderTokensEndpoint,
} from "../lib/endpoints";
import {
  normalizeGuestCheckout,
  normalizeGuestOrder,
  normalizeGuestOrderTokens,
  normalizeGuestPayment,
} from "../lib/contract";
import type {
  GuestCheckoutRequest,
  GuestCheckoutResult,
  GuestOrder,
  GuestOrderTokensResult,
  GuestPaymentMethod,
  GuestPaymentResult,
} from "../types";
import { guestFetch } from "./guestFetch";

/**
 * Both header spellings are sent: the guide documents `X-Idempotency-Key`
 * while the OAS/legacy builds read `Idempotency-Key`. The backend ignores the
 * one it does not use, and retries keep the same value either way.
 */
function idempotencyHeaders(key: string): Record<string, string> {
  return {
    "Idempotency-Key": key,
    "X-Idempotency-Key": key,
  };
}

/**
 * Guest checkout / order access.
 *
 * `checkout` and `initiatePayment` must carry an idempotency key — the caller
 * generates/reuses it via `utils/idempotency`. CSRF is injected by the proxy
 * or `guestFetch`. `getOrder` is cookie-owned (confirmation page); access
 * tokens can be re-issued for the owning browser when the raw tokens were
 * lost after a refresh.
 */
export const guestCheckoutService = {
  checkout: (
    payload: GuestCheckoutRequest,
    idempotencyKey: string,
    lang?: string,
  ): Promise<GuestCheckoutResult> =>
    guestFetch<ApiResponse<unknown>>(GUEST_CHECKOUT, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: idempotencyHeaders(idempotencyKey),
      lang,
    }).then((response) => normalizeGuestCheckout(response.data)),

  initiatePayment: (
    orderId: number,
    payment: { payment_method: GuestPaymentMethod; gateway?: string },
    idempotencyKey: string,
    lang?: string,
  ): Promise<GuestPaymentResult> =>
    guestFetch<ApiResponse<unknown>>(guestOrderPaymentEndpoint(orderId), {
      method: "POST",
      body: JSON.stringify(payment),
      headers: idempotencyHeaders(idempotencyKey),
      lang,
    }).then((response) => normalizeGuestPayment(response.data)),

  /** Cookie-owned order fetch for the confirmation page. */
  getOrder: (orderId: number, lang?: string): Promise<GuestOrder> =>
    guestFetch<ApiResponse<unknown>>(guestOrderEndpoint(orderId), {
      lang,
    }).then((response) => normalizeGuestOrder(response.data)),

  /** Re-issues public tokens for the owning browser. */
  issueAccessTokens: (
    orderId: number,
    lang?: string,
  ): Promise<GuestOrderTokensResult> =>
    guestFetch<ApiResponse<unknown>>(guestOrderTokensEndpoint(orderId), {
      method: "POST",
      lang,
    }).then((response) => normalizeGuestOrderTokens(response.data)),
};
